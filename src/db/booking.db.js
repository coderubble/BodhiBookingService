const { Sequelize } = require("sequelize");
const enviroment = process.env;

module.exports.sequelize = function () {
  let seq = null;
  return function () {
    if (seq === null) {
      seq = new Sequelize(
        enviroment.POSTGRES_DB,
        enviroment.POSTGRES_USER,
        enviroment.POSTGRES_PASSWORD,
        {
          host: enviroment.POSTGRES_HOST,
          dialect: "postgres",
        //  logging: false,
          define: {
            timestamps: true
          }
        }
      );
      return seq;
    }
  };
}();