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
   await queryInterface.bulkInsert('Regions', [
    {
      region_name: "Macvanski",
      country_id: 1
    },
    {
      region_name: "Sremski",
      country_id: 1
    },
    {
      region_name: "Kolubarski",
      country_id: 1
    },
    {
      region_name: "Centralni Federalni okrug",
      country_id: 4
    },
    {
      region_name: "Juzni Federalni okrug",
      country_id: 4
    },
    {
      region_name: "Uralski Federalni okrug",
      country_id: 4
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
    await queryInterface.bulkDelete('Regions',null,{});
  }
};
