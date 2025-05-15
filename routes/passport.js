import express from 'express';
import { slugify } from '../lib/utilities.js';
const router = express.Router();
import countries from '../database/countriesData.js'
const passports = countries.map(({id, slug}) => ({id, slug, countries: []}));
countries.forEach((c) => {
    c.passports.forEach((p) => {
        const slug = slugify(p.countryName);
        const passport = passports.find(p => p.slug === slug);
        if(!passport){
            throw new Error(`Passport not found: ${slug}`);
        }
        passport.countries.push({
            ...p,
            countryName: c.slug,
        })
    });
});

router.get('/', (req, res) => {
    const passportList = passports.map((p) => {
        const visaRequiredCount = p.countries.reduce((acc, curr) => {
            if(curr.isVisaRequired){
                acc++;
            }
            return acc;
        }, 0);
        return {
            id: p.id,
            slug: p.slug,
            visaRequired: visaRequiredCount,
            totalCountries: p.countries.length + 1,
            visaNotRequired: p.countries.length - visaRequiredCount + 1, 
        }
    });
    res.send(passportList.sort((a, b) => a.slug.localeCompare(b.slug)));
});

router.get('/:passportSlug', (req, res) => {
    const { passportSlug } = req.params;
    const passportData = passports.find(p => p.slug === passportSlug);
    if(!passportData){
        return res.status(404).send({ error: 'Passport not found' });
    }
    res.send(passportData);
});

export default router;