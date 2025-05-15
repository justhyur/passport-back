import { fileExists, readJSON, writeJSON } from '../lib/file.js';
import chalk from 'chalk';
import { delay } from '../lib/utilities.js';
import getPassportData from '../api/getPassportData.js';

const logBold = (content) => console.log(chalk.green.bold(content));
const log = (content) => console.log(chalk.green(content));

const run = async () => {
    try{
        const countrySlugs = readJSON('./database/countrySlugs.json');
        const allPassports = [];
        logBold('Scraping visa requirements...');
        for(let i=0; i<countrySlugs.length; i++){
            const countrySlug = countrySlugs[i];
            const passportData = await getPassportData(countrySlug);
            allPassports.push(passportData);
            log(`Scraped ${countrySlug} visa requirements. (${i + 1}/${countrySlugs.length})`);
            await delay(250);
        }
        logBold('Finished scraping visa requirements!');
        if(fileExists('./database/passportsData.json')){
            const updates = [];
            const oldPassports = readJSON('./database/passportsData.json');
            allPassports.forEach((newPassport) => {
                const oldPassport = oldPassports.find(p => p.slug === newPassport.slug);
                if(!oldPassport){
                    throw new Error(`Passport not found in old passports: ${newPassport.slug}`);
                }
                newPassport.countries.forEach((newCountry) => {
                    const oldCountry = oldPassport.countries.find(c => c.countryName === newCountry.countryName);
                    if(!oldCountry){
                        throw new Error(`Country not found in old passport: ${newCountry.countryName}`);
                    }
                    if(
                        newCountry.isVisaRequired !== oldCountry.isVisaRequired ||
                        newCountry.isEVisa !== oldCountry.isEVisa ||
                        newCountry.visaRequirement !== oldCountry.visaRequirement ||
                        newCountry.visaDays !== oldCountry.visaDays
                    ){
                        updates.push({
                            passport: newPassport.slug,
                            countryName: newCountry.countryName,
                            new: newCountry,
                            old: oldCountry,
                        });
                    }
                });
            });
            if(updates.length > 0){
                logBold('Found updates in visa requirements!');
                updates.forEach(update => {
                    log(`Updated ${update.passport} - ${update.countryName}`);
                    log(`Old: ${JSON.stringify(update.old)}`);
                    log(`New: ${JSON.stringify(update.new)}`);
                });
            }
        }
        writeJSON('./database/passportsData.json', allPassports);
        logBold('Saved visa requirements to database/passportsData.json');
    }catch(error){
        console.error('Error scraping the page:', error);
        return;
    }
}

run();





