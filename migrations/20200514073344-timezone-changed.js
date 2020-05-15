'use strict';
module.exports = {
  up: (queryInterface) => {
    return queryInterface.sequelize.query("SET TIME ZONE 'Australia/Sydney'");
  }
};
