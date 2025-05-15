import express from 'express';
const router = express.Router();
import countries from '../database/countriesData.js'

router.get('/', (req, res) => {
    const countriesList = countries.map((c) => {
        const visaRequiredCount = c.passports.reduce((acc, curr) => {
            if(curr.isVisaRequired){
                acc++;
            }
            return acc;
        }, 0);
        return {
            id: c.id,
            slug: c.slug,
            visaRequired: visaRequiredCount,
            totalPassports: c.passports.length + 1,
            visaNotRequired: c.passports.length - visaRequiredCount + 1, 
        }
    })
    res.send(countriesList.sort((a, b) => a.slug.localeCompare(b.slug)));
});

router.get('/:countrySlug', (req, res) => {
    const { countrySlug } = req.params;
    const countryData = countries.find(p => p.slug === countrySlug);
    if(!countryData){
        return res.status(404).send({ error: 'Country not found' });
    }
    res.send(countryData);
});

export default router;