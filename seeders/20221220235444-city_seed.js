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
   await queryInterface.bulkInsert('Cities', [
    {
      city_name: "Belgrade",
      country_id: 1,
      region_id: 2
    },
    {
      city_name: "Loznica",
      country_id: 1
    },
    {
      city_name: "Mali Zvornik",
      country_id: 1,
      region_id: 1,
    },
    {
      city_name: "Peking",
      country_id: 2,
      region_id: 0
    },
    {
      city_name: "Hong Kong",
      country_id: 2,
      region_id: 0
    },
    {
      city_name: "Moscow",
      country_id: 4,
      region_id: 4
    },
    {
      city_name: "St. Peterburg",
      country_id: 4,
      region_id: 4
    },
    {
      city_name: "Paris",
      country_id: 5,
      region_id: 0
    },
    {
      city_name: "Madrid",
      country_id: 6,
      region_id: 0
    },
    {
      city_name: "Rome",
      country_id: 3,
      region_id: 0
    }
  ], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Cities', null, {});
  }
};
