const express = require('express');
const ejsLayouts = require('express-ejs-layouts');
const csuse = require("useful-tools");
const http = require('http');
const bookman = require("bookman");
const url = require("url");
const request = require("request");
const Discord = require("discord.js");
const ejs = require("ejs");
const fs = require("fs");
const n = require("nodme");
const cookieParser = require("cookie-parser");
const hastebin = require("hastebin-gen");
const bodyParser = require("body-parser");
const path = require("path");
const passport = require("passport");
const { Strategy } = require("passport-discord");
const session = require("express-session");
const client = new Discord.Client();
const randomString = require("random-string");
const db = (global.db = {});

let ranks = ["javascript", "javascriptplus", "html", "altyapi", "api", "istekler"];
for (let rank in ranks) {
  db[ranks[rank]] = new bookman(ranks[rank]);
}


const IDler = {
  botID: "701469929177743441",
  botSecret: "ptFG3tzXHl4IUEWbX05u6HbnZzYNlmZr",
  botCallbackURL: "https://www.codeworkweb.cf/callback",
  sunucuID: "707632395397890058",
  sunucuDavet: "https://discord.gg/F5zCM2f",
  kodLogKanalı: "751897977773228162",
  sahipRolü: "722069338776928331",
  adminRolü: "722069341041983609",
  kodPaylaşımcıRolü: "732304760765677689",
  kodPaylaşamayacakRoller: ["yok", "BANLI ROL İD"],
  htmlRolü: "722069348902109256",
  javascriptplusRolü: "722069344871383100",
  javascriptRolü: "722069348109385838",
  altyapiRolü: "799396583375503420",
  aboneRolü: "799739677561061388",
  boosterRolü: "737283512201248809",
  üyeRolü: "722069345475493948",
  destekekibRolü: ["728198165576155156","799399801225347142"],
  anasayfa: "https://www.codeworkweb.cf",
  sss: "https://www.codeworkweb.cf/sss",
  ekbilgiler: "https://www.codeworkweb.cf/ekbilgiler",
  youtube: "https://www.youtube.com/channel/UCBbC9MUCQl8kDd7b07fPCCw",
  v11tov12: ""
};

const app = express();
app.use(express.static("/public"));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: false
  })
);
app.use(cookieParser());
app.engine("views", require("ejs").renderFile);
 ({
    defaultLayout: "main",
    layoutsDir: `${__dirname}/views/layouts/`
  })


app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});
const scopes = ["identify", "guilds"];
passport.use(
  new Strategy(
    {
      clientID: IDler.botID,
      clientSecret: IDler.botSecret,
      callbackURL: IDler.botCallbackURL,
      scope: scopes
    },
    (accessToken, refreshToken, profile, done) => {
      process.nextTick(() => done(null, profile));
    }
  )
);
app.use(
  session({
    secret: "secret-session-thing",
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.get(
  "/giris",
  passport.authenticate("discord", {
    scope: scopes
  })
);
app.get(
  "/callback",
  passport.authenticate("discord", {
    failureRedirect: "/error"
  }),
  (req, res) => {
    res.redirect("/");
  }
);
app.get("/cikis", (req, res) => {
  req.logOut();
  return res.redirect("/");
});
app.get("/davet", (req, res) => {
  res.redirect(IDler.sunucuDavet);
});
app.get("/anasayfa", (req, res) => {
  res.redirect(IDler.anasayfa);
});

app.get("/youtube", (req, res) => {
  res.redirect(IDler.youtube);
});




/* SAYFALAR BURADAN İTİBAREN */

app.get("/", (req, res) => {
  res.render("index", {
    user: req.user
  });
});

app.get("/kategori/javascript", (req, res) => {
  var data = db.javascript.get("kodlar");
  data = sortData(data);
      
  res.render("javascript", {
    user: req.user,
    kodlar: data
  });
});
app.get("/kategori/javascript/:id", (req, res) => {
  if (
    !req.user ||
    !client.guilds.cache.get(IDler.sunucuID).members.cache.has(req.user.id)
  )
    return res.redirect(
      url.format({
        pathname: "/hata",
        query: {
          statuscode: 137,
          message:
            "Kodları Görebilmek için Discord sunucumuza katılıp, siteye giriş yapmanız gerekmektedir."
        }
      })
    );

  var id = req.params.id;
  if (!id) req.redirect("/");
  let data = db.javascript.get("kodlar");
  var code = findCodeToId(data, id);
  if (code) {
    res.render("kod", {
      user: req.user,
      kod: code
    });
  } else {
    res.redirect("/");
  }
});
app.get("/kategori/javascriptplus", (req, res) => {
  var data = db.javascriptplus.get("kodlar");
  data = sortData(data);
  res.render("javascriptplus", {
    user: req.user,
    kodlar: data
  });
});
app.get("/kategori/javascriptplus/:id", (req, res) => {
  if (
    !req.user ||
    !client.guilds.cache.get(IDler.sunucuID).members.cache.has(req.user.id)
  )
    return res.redirect(
      url.format({
        pathname: "/hata",
        query: {
          statuscode: 137,
          message:
            "Kodları Görebilmek için Discord sunucumuza katılıp, siteye giriş yapmanız gerekmektedir."
        }
      })
    );

  var id = req.params.id;
  if (!id) req.redirect("/");
  let data = db.javascriptplus.get("kodlar");
  var code = findCodeToId(data, id);
  if (code) {
    let guild = client.guilds.cache.get(IDler.sunucuID);
    let member = req.user ? guild.members.cache.get(req.user.id) : null;
    if (
      member &&
      (member.roles.cache.has(IDler.javascriptplusRolü) ||
        member.roles.cache.has(IDler.sahipRolü) ||
        member.roles.cache.has(IDler.kodPaylaşımcıRolü) ||
        member.roles.cache.has(IDler.adminRolü))
    ) {
      res.render("kod", {
        user: req.user,
        kod: code,
      });
    } else {
      res.redirect(
        url.format({
          pathname: "/hata",
          query: {
            statuscode: 501,
            message: "Bu Kodu Görebilmek İçin Javascript+ Rolüne Sahip Olmalısınız."
          }
        })
      );
    }
  } else {
    res.redirect("/");
  }
});

app.get("/kategori/altyapi", (req, res) => {
  var data = db.altyapi.get("kodlar");
  data = sortData(data);
  res.render("altyapi", {
    user: req.user,
    kodlar: data
  });
});
app.get("/kategori/altyapi/:id", (req, res) => {
  if (
    !req.user ||
    !client.guilds.cache.get(IDler.sunucuID).members.cache.has(req.user.id)
  )
    return res.redirect(
      url.format({
        pathname: "/hata",
        query: {
          statuscode: 137,
          message:
            "Kodları Görebilmek için Discord sunucumuza katılıp, siteye giriş yapmanız gerekmektedir."
        }
      })
    );

  var id = req.params.id;
  if (!id) req.redirect("/");
  let data = db.altyapi.get("kodlar");
  var code = findCodeToId(data, id);
  if (code) {
    let guild = client.guilds.cache.get(IDler.sunucuID);
    let member = req.user ? guild.members.cache.get(req.user.id) : null;
    if (
      member &&
      (member.roles.cache.has(IDler.altyapiRolü) ||
        member.roles.cache.has(IDler.aboneRolü) ||
        member.roles.cache.has(IDler.sahipRolü) ||
        member.roles.cache.has(IDler.kodPaylaşımcıRolü) ||
        member.roles.cache.has(IDler.adminRolü))
    ) {
      res.render("kod", {
        user: req.user,
        kod: code
      });
    } else {
      res.redirect(
        url.format({
          pathname: "/hata",
          query: {
            statuscode: 501,
            message: "Bu Kodu Görebilmek İçin Altyapı Rolüne Sahip Olmalısınız."
          }
        })
      );
    }
  } else {
    res.redirect("/");
  }
});

app.get("/kategori/html", (req, res) => {
  var data = db.html.get("kodlar");
  data = sortData(data);
  res.render("html", {
    user: req.user,
    kodlar: data
  });
});
app.get("/kategori/html/:id", (req, res) => {
  if (
    !req.user ||
    !client.guilds.cache.get(IDler.sunucuID).members.cache.has(req.user.id)
  )
    return res.redirect(
      url.format({
        pathname: "/hata",
        query: {
          statuscode: 137,
          message:
            "Kodları Görebilmek için Discord sunucumuza katılıp, siteye giriş yapmanız gerekmektedir."
        }
      })
    );

  var id = req.params.id;
  if (!id) req.redirect("/");
  let data = db.html.get("kodlar");
  var code = findCodeToId(data, id);
  if (code) {
    let guild = client.guilds.cache.get(IDler.sunucuID);
    let member = req.user ? guild.members.cache.get(req.user.id) : null;
    if (
      member &&
      (member.roles.cache.has(IDler.htmlRolü) ||
        member.roles.cache.has(IDler.sahipRolü) ||
        member.roles.cache.has(IDler.kodPaylaşımcıRolü) ||
        member.roles.cache.has(IDler.adminRolü))
    ) {
      res.render("kod", {
        user: req.user,
        kod: code
      });
    } else {
      res.redirect(
        url.format({
          pathname: "/hata",
          query: {
            statuscode: 501,
            message: "Bu Kodu Görmek İçin Gerekli Rolünüz Yok."
          }
        })
      );
    }
  } else {
    res.redirect("/");
  }
});

app.get("/istekler", (req, res) => {
  var data = db.istekler.get("kodlar");
  data = sortData(data);
  let guild = client.guilds.cache.get(IDler.sunucuID);
  let member = req.user ? guild.members.cache.get(req.user.id) : null;
    if (
      member &&
      (member.roles.cache.has(IDler.sahipRolü) ||
        member.roles.cache.has(IDler.kodPaylaşımcıRolü) ||
        member.roles.cache.has(IDler.adminRolü))
    ){
  res.render("istekler", {
    user: req.user,
    kodlar: data
  });
      } else {
      res.redirect(
        url.format({
          pathname: "/hata",
          query: {
            statuscode: 501,
            message: "Bu Sayfayı görebilmek İçin Yeterli yetkiye sahip değilsiniz."
          }
        })
      );
    }

});
app.get("/istekler/:id", (req, res) => {
  if (
    !req.user ||
    !client.guilds.cache.get(IDler.sunucuID).members.cache.has(req.user.id)
  )
    return res.redirect(
      url.format({
        pathname: "/hata",
        query: {
          statuscode: 137,
          message:
            "Kodları Görebilmek için Discord sunucumuza katılıp, siteye giriş yapmanız gerekmektedir."
        }
      })
    );

  var id = req.params.id;
  if (!id) req.redirect("/");
  let data = db.istekler.get("kodlar");
  var code = findCodeToId(data, id);
  if (code) {
    let guild = client.guilds.cache.get(IDler.sunucuID);
    let member = req.user ? guild.members.cache.get(req.user.id) : null;
    if (
      member &&
      (member.roles.cache.has(IDler.sahipRolü) ||
        member.roles.cache.has(IDler.kodPaylaşımcıRolü) ||
        member.roles.cache.has(IDler.adminRolü))
    ) {
      res.render("istek", {
        user: req.user,
        istek: code
      });
    } else {
      res.redirect(
        url.format({
          pathname: "/hata",
          query: {
            statuscode: 501,
            message: "Bu Sayfayı görebilmek İçin Yeterli yetkiye sahip değilsiniz."
          }
        })
      );
    }
  } else {
    res.redirect("/");
  }
});


app.get("/profil/:id", (req, res) => {
  let id = req.params.id;
  let member = client.guilds.cache.get(IDler.sunucuID).members.cache.get(id);
  if (!member)
    res.redirect(
      url.format({
        pathname: "/hata",
        query: {
          statuscode: 501,
          message: "Belirtilen Profil Bulunamadı"
        }
      })
    );
  else {
    let perms = {
      javascriptplus:
        member.roles.cache.has(IDler.sahipRolü) ||
        member.roles.cache.has(IDler.adminRolü) ||
        member.roles.cache.has(IDler.kodPaylaşımcıRolü) ||
        member.roles.cache.has(IDler.javascriptplusRolü) ||
        member.roles.cache.has(IDler.hazırSistemlerRolü),
      html:
        member.roles.cache.has(IDler.sahipRolü) ||
        member.roles.cache.has(IDler.adminRolü) ||
        member.roles.cache.has(IDler.kodPaylaşımcıRolü) ||
        member.roles.cache.has(IDler.htmlRolü),
      yetkili:
        member.roles.cache.has(IDler.sahipRolü),
      admin:
        member.roles.cache.has(IDler.adminRolü),
      destekekibi:
        member.roles.cache.has(IDler.destekekibRolü),
      kodcu:
        member.roles.cache.has(IDler.kodPaylaşımcıRolü),
      destekci:
      member.roles.cache.has(IDler.boosterRolü)
    };
    res.render("profil", {
      user: req.user,
      kurulus: csuse.tarih(member.user.createdTimestamp),
      member: member,
      avatarURL: member.user.avatarURL(),
      perms: perms,
      stats: db.api.get(`${member.user.id}`)
    });
  }
});

app.get("/sil/:rank/:id", (req, res) => {
  if (req.user) {
    let member = client.guilds.cache
      .get(IDler.sunucuID)
      .members.cache.get(req.user.id);
    if (!member) {
      res.redirect(
        url.format({
          pathname: "/hata",
          query: {
            statuscode: 502,
            message: "Bu Sayfayı Görmek İçin Gerekli Yetkiye Sahip Değilsiniz"
          }
        })
      );
    } else {
      if (
        member.roles.cache.has(IDler.sahipRolü)
      ) {
        let id = req.params.id;
        if (!id) {
          res.redirect(
            url.format({
              pathname: "/hata",
              query: {
                statuscode: 504,
                message: "Bir Kod İd'si Belirtin"
              }
            })
          );
        }
        let rank = req.params.rank;
        if (!rank) {
          res.redirect(
            url.format({
              pathname: "/hata",
              query: {
                statuscode: 504,
                message: "Bir kod rankı'si belirtin"
              }
            })
          );
        }

        var rawId = findCodeToId(db[rank].get("kodlar"), id);
        if (!rawId)
          res.redirect(
            url.format({
              pathname: "/hata",
              query: {
                statuscode: 504,
                message: "Üzgünüm ancak böyle bir kod hiçbir zaman bulunmadı!"
              }
            })
          );
        else {
          if (req.user) db.api.add(`${req.user.id}.silinen`, 1);
          db[rank].delete("kodlar." + rawId.isim);
          res.redirect("/");
        }
      } else {
        res.redirect(
          url.format({
            pathname: "/hata",
            query: {
              statuscode: 502,
              message: "Bu sayfayı görmek için gerekli yetkiye sahip değilsiniz"
            }
          })
        );
      }
    }
  } else {
    res.redirect(
      url.format({
        pathname: "/hata",
        query: {
          statuscode: 501,
          message: "Bu sayfayı görmek için giriş yapmalısınız"
        }
      })
    );
  }
});

app.get("/sss", (req, res) => {
  res.render("sss", {
    user: req.user
  });
});

app.get("/ekbilgiler", (req, res) => {
  res.render("ekbilgiler", {
    user: req.user
  });
});

app.get("/v11tov12", (req, res) => {
  res.render("v11tov12", {
    user: req.user
  });
});

app.get("/kodekle", (req, res) => {
  if (
    !req.user ||
    !client.guilds.cache.get(IDler.sunucuID).members.cache.has(req.user.id)
  )
    return res.redirect(
      url.format({
        pathname: "/hata",
        query: {
          statuscode: 138,
          message:
            "Kod paylaşabilmek için Discord sunucumuza katılmanız ve siteye giriş yapmanız gerekmektedir."
        }
      })
    );
  let guild = client.guilds.cache.get(IDler.sunucuID);
  let member = req.user ? guild.members.cache.get(req.user.id) : null;
    if (
      member &&
        (member.roles.cache.has(IDler.sahipRolü) ||
        member.roles.cache.has(IDler.kodPaylaşımcıRolü) ||
        member.roles.cache.has(IDler.adminRolü))
    ) {
  res.render("kodekle", {
    user: req.user
  });
 } else {
      res.redirect(
        url.format({
          pathname: "/hata",
          query: {
            statuscode: 501,
            message: "Kod Ekleyebilmek için gerekli yetkiye sahip değilsin!"
          }
        })
      );
    }

});

app.post("/paylasim", (req, res) => {
  let guild = client.guilds.cache.get(IDler.sunucuID);
  let member = req.user ? guild.members.cache.get(req.user.id) : null;
  let rank = "topluluk"
  if (
    member &&
    IDler.kodPaylaşamayacakRoller.some(id => member.roles.cache.has(id))
  )
    return res.redirect(
      url.format({
        pathname: "/hata",
        query: {
          statuscode: 502,
          message: "Kod Paylaşma İznin Yok!"
        }
      })
    );
  if (
    member &&
    (member.roles.cache.has(IDler.sahipRolü) ||
      member.roles.cache.has(IDler.kodPaylaşımcıRolü) ||
      member.roles.cache.has(IDler.adminRolü))
  )
    
    rank = req.body.kod_rank;

  
  let obj = {
    isim: req.body.kod_adi,
    sürüm: req.body.sürüm,
    not: req.body.not,
    not2: req.body.not2,
    id: randomString({ length: 10 }),
    desc: req.body.desc,
    icon: req.user
      ? `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.png`
      : `https://cdn.discordapp.com/icons/${IDler.sunucuID}/a_830c2bcfa4f1529946e82f15441a1227.jpg`,
    main_code: req.body.main_code,
    komutlar_code: req.body.komutlar_code,
    kod_rank: rank,
    k_adi: req.user.username,
    k_tagi: req.user.discriminator,
    idsi: req.user,
    date: new Date(Date.now()).toLocaleDateString()
  };
  if (req.user) db.api.add(`${req.user.id}.paylasilan`, 1);
  db[obj.kod_rank].set(`kodlar.${obj.isim}`, obj);
  res.redirect(`/${obj.kod_rank}/${obj.id}`);
});

app.get("/istekbildir", (req, res) => {
  if (
    !req.user ||
    !client.guilds.cache.get(IDler.sunucuID).members.cache.has(req.user.id)
  )
    return res.redirect(
      url.format({
        pathname: "/hata",
        query: {
          statuscode: 138,
          message:
            "İstek bildirebilmek için Discord sunucumuza katılmanız ve siteye giriş yapmanız gerekmektedir."
        }
      })
    );
  let guild = client.guilds.cache.get(IDler.sunucuID);
  let member = req.user ? guild.members.cache.get(req.user.id) : null;
    if (
      member &&
        (member.roles.cache.has(IDler.üyeRolü) ||
        member.roles.cache.has(IDler.kodPaylaşımcıRolü) ||
        member.roles.cache.has(IDler.adminRolü))
    ) {
  res.render("istekbildir", {
    user: req.user
  });
 } else {
      res.redirect(
        url.format({
          pathname: "/hata",
          query: {
            statuscode: 501,
            message: "Bu sayfayı görmek için yeterli yetkiye sahip değilsin!"
          }
        })
      );
    }

});

app.post("/istekpaylas", (req, res) => {
  let guild = client.guilds.cache.get(IDler.sunucuID);
  let member = req.user ? guild.members.cache.get(req.user.id) : null;
  let rank = "topluluk"
  if (
    member &&
    IDler.kodPaylaşamayacakRoller.some(id => member.roles.cache.has(id))
  )
    return res.redirect(
      url.format({
        pathname: "/hata",
        query: {
          statuscode: 502,
          message: "Kod Paylaşma İznin Yok!"
        }
      })
    );
  if (
    member &&
    (member.roles.cache.has(IDler.üyeRolü) ||
      member.roles.cache.has(IDler.kodPaylaşımcıRolü) ||
      member.roles.cache.has(IDler.adminRolü))
  )
    
    rank = req.body.kod_rank;

  
  let obj = {
    isim: req.body.kod_adi,
    sürüm: req.body.sürüm,
    not: req.body.not,
    id: randomString({ length: 10 }),
    desc: req.body.desc,
    icon: req.user
      ? `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.png`
      : `https://cdn.discordapp.com/icons/${IDler.sunucuID}/a_830c2bcfa4f1529946e82f15441a1227.jpg`,
    kod_rank: rank,
    k_adi: req.user.username,
    k_tagi: req.user.discriminator,
    idsi: req.user.id,
    date: new Date(Date.now()).toLocaleDateString()
  };
  if (req.user) db.api.add(`${req.user.id}.istenilen`, 1);
});

function findCodeToId(data, id) {
  var keys = Object.keys(data);
  keys = keys.filter(key => data[key].id == id)[0];
  keys = data[keys];
  return keys;
}

function sortData(object) {
  var keys = Object.keys(object);
  var newData = {};
  var arr = [];
  keys.forEach(key => {// sup pothc :)
    arr.push(key);
  });
  arr.reverse();
  arr.forEach(key => {
    newData[key] = object[key];
  })
  return newData;
}

app.get("/hata", (req, res) => {
  res.render("hata", {
    user: req.user,
    statuscode: req.query.statuscode,
    message: req.query.message
  });
});

app.use((req, res) => {
  const err = new Error("Not Found");
  err.status = 404;
  return res.redirect(
    url.format({
      pathname: "/hata",
      query: {
        statuscode: 404,
        message: "Sayfa Bulunamadı"
      }
    })
  );
});


client.login(process.env.TOKEN);

client.on("ready", () => {
  const listener = app.listen(process.env.PORT, function() {
    console.log("Proje Hazır!");
  });
});
