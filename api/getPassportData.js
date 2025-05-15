import { JSDOM } from 'jsdom';

export default async function getPassportData(countryCode) {
    // Fetch the page content
    const response = await fetch(`https://www.passportindex.org/passport/${countryCode}/`);
    const text = await response.text();
    const dom = new JSDOM(text);
    const { document } = dom.window;
    // Extract the table rows
    const trs = document.querySelector('#psprt-dashboard-table > tbody').children;
    const countryImage = document.querySelector('#psprt-dashboard > div:nth-child(2) > div.col-xs-12.col-sm-7.col-md-8 > div:nth-child(1) > div.col-xs-4.col-sm-5.col-md-3.text-center.psprt-dashboard-cover > div > img');
    const countryImageSrc = countryImage.getAttribute('src');
    // https://www.passportindex.org/countries/ar.png
    const [, imageFile] = countryImageSrc.split('https://www.passportindex.org/countries/');
    // ['','ar.png']
    const [countryId] = imageFile.split(".png");
    // ['ar']
    const countries = [];
    Array.from(trs).forEach(tr => {
        const isVisaRequired = tr.classList.contains('vr'); 
        const isEVisa = tr.classList.contains('evisa');
        const countryName = tr.children[0].textContent.trim();
        const country = {
            countryName,
            isVisaRequired,
            isEVisa
        }
        const rawVisaRequirement = tr.children[1].textContent
        .replace('Apply now', '')
        .trim()
        ;
        if(!rawVisaRequirement.includes('days')){
            country.visaRequirement = rawVisaRequirement;
            countries.push(country);
            return;
        }
        const visaRequirementResults = rawVisaRequirement.split('/');
        const visaDays = visaRequirementResults[visaRequirementResults.length - 1]
        .toLowerCase()
        .replace('days', '')
        .trim();
        visaRequirementResults.pop();
        const visaRequirement = visaRequirementResults.join('/').trim();
        country.visaRequirement = visaRequirement;
        country.visaDays = Number(visaDays);
        countries.push(country);
    });
    return {
        countries,
        id: countryId,
        slug: countryCode,
    };
}