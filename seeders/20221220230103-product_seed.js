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

    await queryInterface.bulkInsert('Products', [
      {
        title: "Otter candy dispenser",
        description: "Otter candy dispenser allows you to set up a timer for dispensing treats to your otter. It also supports remote control.",
        image: "../img/otter_dispenser.jpg",
        price: 25.00,
        is_available: true,
        quantity: 10,
        ProductCategoryId: 2
      },
      {
        title: "Otter candy",
        description: "Otter candy is made of most delicious engridients which makes your otter very pleased.",
        image: "../img/otter_candy.jpg",
        price: 2.50,
        is_available: true,
        quantity: 1000,
        ProductCategoryId: 1
      },
      {
        title: "Bouncy ball",
        description: "Bouncy ball is a great toy for your energetic otter. Bouncy ball is available in few different colors.",
        image: "../img/otter_bouncy_ball.jpg",
        price: 5.35,
        is_available: true,
        quantity: 100,
        ProductCategoryId: 2
      }
    ])
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Products', null, {});
  }
};
