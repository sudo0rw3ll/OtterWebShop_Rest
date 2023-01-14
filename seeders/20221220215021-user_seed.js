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
   await queryInterface.bulkInsert('Users',[
    {
      name: "Vid",
      surname: "Nikolic",
      email: "nikolicvidniko@gmail.com",
      username: "dvi015",
      password: "015dvi123!",
      mobile_phone: "0604100601",
      role_id: 3,
      location_id: 1
    },
    {
      name: "Jovana",
      surname: "Radakovic",
      email: "jovanajokaradakovic@gmail.com",
      username: "joka011",
      password: "011joka123!",
      mobile_phone: "0604100602",
      role_id: 3,
      location_id: 2
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
    await queryInterface.bulkDelete('Users', null, {});
  }
};
