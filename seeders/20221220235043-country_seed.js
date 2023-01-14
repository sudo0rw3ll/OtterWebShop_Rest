'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
   await queryInterface.bulkInsert('Countries', [
    {
      country_name: "Serbia",
      iso2: "RS"
    },
    {
      country_name: "China",
      iso2: "CN"
    },
    {
      country_name: "Italy",
      iso2: "IT"
    },
    {
      country_name: "Russia",
      iso2: "RU"
    },
    {
      country_name: "France",
      iso2: "FR"
    },
    {
      country_name: "Spain",
      iso2: "SP"
    }
  ],{});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Countries', null, {});
  }
};
