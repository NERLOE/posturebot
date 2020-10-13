const Discord = require("discord.js");
const bot = new Discord.Client();
const { config } = require("dotenv");
config({
  path: __dirname + "/.env",
});

bot.on("ready", () => {
  console.log(`Botten er klar som ${bot.user.tag}!`);
  updateBotActivity();
  checkPostures();
});

var lastCheck = null;
async function checkPostures() {
  bot.guilds.cache.forEach(async (guild) => {
    const voiceChannels = guild.channels.cache.filter(
      (c) => c.type === "voice"
    );

    for await (var vc of voiceChannels) {
      vc = vc[1];
      console.log(vc.name, vc.speakable, vc.members.size);
      if (vc.members.size > 0) {
        const pc = await checkPosture(vc);
        console.log("Successfully posture checked the channel: " + pc.name);
      }
    }

    console.log("The posture check is now finished!");
    lastCheck = new Date();
  });

  setTimeout(checkPostures, 1000 * 60 * 30);
}

async function checkPosture(voiceChannel) {
  return new Promise((resolve, reject) => {
    voiceChannel
      .join()
      .then((connection) => {
        const dispatcher = connection.play("posturecheck.mp3", {
          volume: 1.0,
        });
        dispatcher.on("finish", (end) => {
          dispatcher.destroy();
          voiceChannel.leave();
          setTimeout(() => {
            resolve(voiceChannel);
          }, 1000);
        });
      })
      .catch((err) => {
        console.log(
          "Der opstod en fejl, ved tilslutningen af en voice channel."
        );
        console.log(err);
        resolve(voiceChannel);
      });
  });
}

function formatDate(number) {
  return number >= 10 ? number : "0" + number;
}

function updateBotActivity() {
  if (lastCheck) {
    let fDate =
      formatDate(lastCheck.getDate()) +
      "/" +
      formatDate(lastCheck.getMonth()) +
      " kl. " +
      formatDate(lastCheck.getHours()) +
      ":" +
      formatDate(lastCheck.getMinutes());
    bot.user.setActivity("peoples posture...\nLast check: " + fDate, {
      url: "https://minetech.dk",
      type: "WATCHING",
    });
  } else {
    bot.user.setActivity("peoples posture...", {
      url: "https://minetech.dk",
      type: "WATCHING",
    });
  }

  setTimeout(updateBotActivity, 1000 * 10);
}

bot.login(process.env.TOKEN);
