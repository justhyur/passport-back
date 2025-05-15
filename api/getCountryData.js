import { JSDOM } from 'jsdom';

export default async function getCountryData(countrySlug) {
    // Fetch the page content
    const response = await fetch(`https://www.passportindex.org/country/${countrySlug}/`);
    const text = await response.text();
    const dom = new JSDOM(text);
    const { document } = dom.window;
    // Extract the table rows
    const trs = document.querySelector('#psprt-dashboard-table > tbody').children;
    const imgSpan = document.querySelector('#psprt-dashboard > div:nth-child(2) > div.col-xs-12.col-sm-7.col-md-8 > div:nth-child(1) > div.col-xs-4.col-sm-5.col-md-3.text-center.flag-dashboard-cover > span')
    const flagIconClass = Array.from(imgSpan.classList).find(c => c.startsWith('flag-icon-'));
    const [, countryId] = flagIconClass.split('flag-icon-');
    const passports = [];
    Array.from(trs).forEach(tr => {
        const isVisaRequired = tr.classList.contains('vr'); 
        const isEVisa = tr.classList.contains('evisa');
        const countryName = tr.children[0].textContent.trim();
        const passport = {
            countryName,
            isVisaRequired,
            isEVisa
        }
        const rawVisaRequirement = tr.children[1].textContent
        .replace('Apply now', '')
        .trim()
        ;
        if(!rawVisaRequirement.includes('days')){
            passport.visaRequirement = rawVisaRequirement;
            passports.push(passport);
            return;
        }
        const visaRequirementResults = rawVisaRequirement.split('/');
        const visaDays = visaRequirementResults[visaRequirementResults.length - 1]
        .toLowerCase()
        .replace('days', '')
        .trim();
        visaRequirementResults.pop();
        const visaRequirement = visaRequirementResults.join('/').trim();
        passport.visaRequirement = visaRequirement;
        passport.visaDays = Number(visaDays);

        passports.push(passport);
    });

    const country = {
        passports,
        id: countryId,
        slug: countrySlug,
    }

    //country specifics
    const dualCitizenshipIcon = document.querySelector('.psprt-dashboard-info i');
    country.isDualCitizenship = dualCitizenshipIcon.classList.contains('glyphicon-ok-circle');
    const dashboardInfos = document.querySelectorAll('.psprt-dashboard-info > div');
    const landAreaDiv = dashboardInfos[1];
    country.landArea = Number(landAreaDiv.children[1].textContent.trim().replaceAll(',', ''));
    const populationDiv = dashboardInfos[2];
    country.population = Number(populationDiv.children[1].textContent.trim().replaceAll(',', ''));
    const validityDiv = dashboardInfos[5];
    country.validity = Number(validityDiv.children[1].textContent.replace('Months', '').trim());

    return country;
}