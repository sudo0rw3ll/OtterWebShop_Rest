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
   await queryInterface.bulkInsert('Transactions', [
    {
      expire_date: '2022-01-17',
      cvv: 245,
      card_number: '2544 4213 331 334',
      owner_name: 'Vid Nikolic',
      status: "Not paid",
      order_payment_id: 1,
      transaction_user_id: 1
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
   await queryInterface.bulkDelete('Transactions', null, {});
  }
};
