import { JSDOM } from 'jsdom';

export default async function getCountrySlugs() {
    // Fetch the page content
    const response = await fetch(`https://www.passportindex.org/passport/united-arab-emirates/`);
    const text = await response.text();
    const dom = new JSDOM(text);
    const { document } = dom.window;
    // Extract the table rows
    const trs = document.querySelector('#psprt-dashboard-table > tbody').children;
    const countrySlugs = ['united-arab-emirates'];
    Array.from(trs).forEach(tr => {
        const a = tr.children[0].querySelector('a');
        const href = a.getAttribute('href'); 
        //"https://www.passportindex.org/country/antigua-and-barbuda/"
        const [, rawCountryCode] = href.split('https://www.passportindex.org/country/'); 
        //['', 'antigua-and-barbuda/']
        const countrySlug = rawCountryCode.replaceAll('/', '').trim();
        countrySlugs.push(countrySlug);
    });
    return countrySlugs;
}