import { fileExists, readJSON, writeJSON } from '../lib/file.js';
import chalk from 'chalk';
import { delay } from '../lib/utilities.js';
import getCountryData from '../api/getCountryData.js';

const logBold = (content) => console.log(chalk.green.bold(content));
const log = (content) => console.log(chalk.green(content));

const run = async () => {
    try{
        const countrySlugs = readJSON('./database/countrySlugs.json');
        const allCountries = [];
        logBold('Scraping countries data...');
        for(let i=0; i<countrySlugs.length; i++){
            const countrySlug = countrySlugs[i];
            const countryData = await getCountryData(countrySlug);
            allCountries.push(countryData);
            log(`Scraped ${countrySlug} country. (${i + 1}/${countrySlugs.length})`);
            await delay(250);
        }
        logBold('Finished scraping countries!');
        if(fileExists('./database/countriesData.json')){
            const updates = [];
            const oldCountries = readJSON('./database/countriesData.json');
            allCountries.forEach((newCountry) => {
                const oldCountry = oldCountries.find(p => p.slug === newCountry.slug);
                if(!oldCountry){
                    throw new Error(`Country not found in old countries: ${newCountry.slug}`);
                }
                newCountry.passports.forEach((newPassport) => {
                    const oldPassport = oldPassport.passports.find(c => c.countryName === newPassport.countryName);
                    if(!oldPassport){
                        throw new Error(`Passport not found in old passports: ${newPassport.countryName}`);
                    }
                    if(
                        newPassport.isVisaRequired !== oldPassport.isVisaRequired ||
                        newPassport.isEVisa !== oldPassport.isEVisa ||
                        newPassport.visaRequirement !== oldPassport.visaRequirement ||
                        newPassport.visaDays !== oldPassport.visaDays
                    ){
                        updates.push({
                            country: newPassport.slug,
                            countryName: newPassport.countryName,
                            new: newPassport,
                            old: oldPassport,
                        });
                    }
                });
            });
            if(updates.length > 0){
                logBold('Found updates in countries!');
                updates.forEach(update => {
                    log(`Updated ${update.country} - ${update.countryName}`);
                    log(`Old: ${JSON.stringify(update.old)}`);
                    log(`New: ${JSON.stringify(update.new)}`);
                });
            }
        }
        writeJSON('./database/countriesData.json', allCountries);
        logBold('Saved visa requirements to database/countriesData.json');
    }catch(error){
        console.error('Error scraping the page:', error);
        return;
    }
}

run();





