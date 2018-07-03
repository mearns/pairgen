/* eslint-env mocha */

// Module under test
const generatePairs = require('../../src/index').generatePairs

// Support modules
const expect = require('chai').expect

describe('generatePairs() function', () => {
    describe('A complete rotation', () => {
        it('should work for interval 0', () => {
            // given
            const members = ['a', 'b', 'c', 'd', 'e', 'f']

            // when
            const resultPairs = generatePairs(members, {
                epoch: new Date('2018-01-01'),
                date: new Date('2018-01-01'),
                period: 7 * 24 * 60 * 60 * 1000,
                offset: 0
            })

            // then
            expect(resultPairs).to.deep.equal([
                ['a', 'b'],
                ['b', 'c'],
                ['c', 'd'],
                ['d', 'e'],
                ['e', 'f'],
                ['f', 'a'],
            ])
        })

        it('should work for interval 1', () => {
            // given
            const members = ['a', 'b', 'c', 'd', 'e', 'f']

            // when
            const resultPairs = generatePairs(members, {
                epoch: new Date('2018-01-01'),
                date: new Date('2018-01-08'),
                period: 7 * 24 * 60 * 60 * 1000,
                offset: 0
            })

            // then
            expect(resultPairs).to.deep.equal([
                ['a', 'c'],
                ['b', 'd'],
                ['c', 'e'],
                ['d', 'f'],
                ['e', 'a'],
                ['f', 'b'],
            ])
        })

        it('should work for interval 2', () => {
            // given
            const members = ['a', 'b', 'c', 'd', 'e', 'f']

            // when
            const resultPairs = generatePairs(members, {
                epoch: new Date('2018-01-01'),
                date: new Date('2018-01-15'),
                period: 7 * 24 * 60 * 60 * 1000,
                offset: 0
            })

            // then
            expect(resultPairs).to.deep.equal([
                ['a', 'd'],
                ['b', 'e'],
                ['c', 'f'],
                ['d', 'a'],
                ['e', 'b'],
                ['f', 'c'],
            ])
        })

        it('should work for interval 3', () => {
            // given
            const members = ['a', 'b', 'c', 'd', 'e', 'f']

            // when
            const resultPairs = generatePairs(members, {
                epoch: new Date('2018-01-01'),
                date: new Date('2018-01-22'),
                period: 7 * 24 * 60 * 60 * 1000,
                offset: 0
            })

            // then
            expect(resultPairs).to.deep.equal([
                ['a', 'e'],
                ['b', 'f'],
                ['c', 'a'],
                ['d', 'b'],
                ['e', 'c'],
                ['f', 'd'],
            ])
        })

        it('should work for the last interval', () => {
            // given
            const members = ['a', 'b', 'c', 'd', 'e', 'f']

            // when
            const resultPairs = generatePairs(members, {
                epoch: new Date('2018-01-01'),
                date: new Date('2018-01-29'),
                period: 7 * 24 * 60 * 60 * 1000,
                offset: 0
            })

            // then
            expect(resultPairs).to.deep.equal([
                ['a', 'f'],
                ['b', 'a'],
                ['c', 'b'],
                ['d', 'c'],
                ['e', 'd'],
                ['f', 'e'],
            ])
        })

        it('should start over for the (n-1)th interval', () => {
            // given
            const members = ['a', 'b', 'c', 'd', 'e', 'f']

            // when
            const resultPairs = generatePairs(members, {
                epoch: new Date('2018-01-01'),
                date: new Date('2018-02-05'),
                period: 7 * 24 * 60 * 60 * 1000,
                offset: 0
            })

            // then
            expect(resultPairs).to.deep.equal([
                ['a', 'b'],
                ['b', 'c'],
                ['c', 'd'],
                ['d', 'e'],
                ['e', 'f'],
                ['f', 'a'],
            ])
        })
    })

    describe('The offset option', () => {
        it('should work for small negative values', () => {
            // given
            const members = ['a', 'b', 'c', 'd', 'e', 'f']

            // when
            const resultPairs = generatePairs(members, {
                epoch: new Date('2018-01-01'),
                date: new Date('2018-01-01'),
                period: 7 * 24 * 60 * 60 * 1000,
                offset: -2
            })

            // then
            expect(resultPairs).to.deep.equal([
                ['a', 'e'],
                ['b', 'f'],
                ['c', 'a'],
                ['d', 'b'],
                ['e', 'c'],
                ['f', 'd'],
            ])
        })

        it('should work for large negative values', () => {
            // given
            const members = ['a', 'b', 'c', 'd', 'e', 'f']

            // when
            const resultPairs = generatePairs(members, {
                epoch: new Date('2018-01-01'),
                date: new Date('2018-01-01'),
                period: 7 * 24 * 60 * 60 * 1000,
                offset: -19
            })

            // then
            expect(resultPairs).to.deep.equal([
                ['a', 'c'],
                ['b', 'd'],
                ['c', 'e'],
                ['d', 'f'],
                ['e', 'a'],
                ['f', 'b'],
            ])
        })
    })
})