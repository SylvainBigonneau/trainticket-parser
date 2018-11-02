const argv = require('minimist')(process.argv.slice(2));
const cheerio = require('cheerio');
const fs = require('fs');

let output = {
    status: 'ok',
    result: {
        trips: [],
        custom: {
            prices: [
            ]
        }
    }
}

const path = argv.f || 'test.html';

try {
    const cleanDoc = fs.readFileSync(path).toString('utf8').replace(/\\r\\n/g, '').replace(/\\"/g, '')
    const $ = cheerio.load(cleanDoc);

    $('.product-header').each((_i, headerElem) => {
        const price = parseFloat($('td:last-child', headerElem).text().replace(',', '.'));
        output.result.custom.prices.push({ value: price })
    });

    $('#mail-background > table:not([id])').each((_i, travelElem) => {
        const $travel = $(travelElem);
        const $orderInfo = $travel.find('#block-travel > tbody > tr > td > .block-pnr');

        const travel = {
            code: $orderInfo.find('.pnr-ref .pnr-info').text().trim(),
            name: $orderInfo.find('.pnr-name .pnr-info').text().trim(),
            details: {
                price: parseFloat($('.total-amount td:last-child').text().replace(',', '.'))
            }
        }

        $travel.find('#block-travel [id^=travel]').each((i, tripElem) => {
            const tripSummary = $('.pnr-summary', tripElem).text();
            const dates = tripSummary.match(/\d{2}\/\d{2}\/\d{4}/g)
            let $trip = $travel.find('#block-command .product-header').eq(i);
            for (let date of dates) {
                $trip = $trip.nextAll('.product-details').first();
                $passengers = $trip.next('.passengers').find('tr');
                const trip = {
                    type: $trip.find('.travel-way').text().trim(),
                    date: new Date(date.split('/').reverse().join('-')),
                    trains: [{
                        departureTime: $trip.find('tr:first-child .origin-destination-hour').text().trim().replace('h', ':'),
                        departureStation: $trip.find('tr:first-child .origin-destination-station').text().trim(),
                        arrivalTime: $trip.find('tr:last-child .origin-destination-hour').text().trim().replace('h', ':'),
                        arrivalStation: $trip.find('tr:last-child .origin-destination-station').text().trim(),
                        type: $trip.find('tr:first-child td:nth-child(4)').text().trim(),
                        number: $trip.find('tr:first-child td:nth-child(5)').text().trim(),
                        passengers: []
                    }]
                }

                $passengers.each((y, passengerElem) => {
                    if (y % 2) { // sadly, :odd selector doesn't seem to work with cheerio
                        $passenger = $(passengerElem);

                        const type = $passenger.find('.fare-details').text().includes('Billet échangeable') ? 'échangeable' : 'non-échangeable';
                        const passenger = {
                            type,
                            age: $passenger.find('.typology').text().match(/\(.+\)/)[0]
                        }
                        trip.trains[0].passengers.push(passenger);    
                    }
                });

                if (dates.length > 1) {
                    travel.details.roundTrips = travel.details.roundTrips ? [...travel.details.roundTrips, trip] : [trip];
                } else {
                    travel.details.singleTrips = travel.details.singleTrips ? [...travel.details.singleTrips, trip] : [trip];
                }
            }

        })

        output.result.trips.push(travel);
    });
} catch (error) {
    output = {
        status: 'nok',
        error
    };
} finally {
    fs.writeFileSync(argv.o || path.replace(/\.html$/g, '-result.json'), JSON.stringify(output));
}
