const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

const waitForTimeout = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// List of domains to process
const domains = ["inpd-leaers.co.uk", "inpd-partners.co.uk", "inpd-transform.co.uk", "inpd-exec.co.uk", "inpd-talent.co.uk", "inpd-professional.co.uk", "inpd-academy.co.uk", "inpd-skills.co.uk", "inpd-education.co.uk", "inpdstrategicdevelopment.co.uk", "inpd-learning.co.uk", "inpd-careers.co.uk", "inpd-growth.co.uk", "inpd-workforce.co.uk", "inpd-progess.co.uk", "inpd-management.co.uk", "inpd-programmes.co.uk", "inpdacademy.co.uk", "inpdmanagement.co.uk", "inpdservices.co.uk", "inpdprogess.co.uk", "inpdleadershipacademy.co.uk", "inpdinnovation.co.uk", "inpdconsultancy.co.uk", "inpdleadershipskills.co.uk", "inpdcareertraining.co.uk", "inpdprogrammes.co.uk", "inpdadvisors.co.uk", "inpd-group.co.uk", "inpd-solutions.co.uk", "inpd-director.co.uk", "inpd-development.co.uk", "inpd-directors.co.uk", "inpd-consulting.co.uk", "inpd-leadership.co.uk", "inpdtalentstrategy.co.uk", "inpd-professionals.co.uk", "inpd-courses.co.uk", "inpd-accelerate.co.uk", "inpd-connect.co.uk", "inpdcoaching.co.uk", "inpdworkforce.co.uk", "inpdmentors.co.uk", "inpdtrainingcourses.co.uk", "inpdprofessionaltraining.co.uk", "inpdstrategy.co.uk", "inpdculture.co.uk", "inpdperformance.co.uk", "inpdleadershiptraining.co.uk", "inpdleadershipsolutions.co.uk", "inpd-services.co.uk", "inpd-culture.co.uk", "inpd-training.co.uk", "inpd-coaching.co.uk", "inpd-mentors.co.uk", "inpd-consultancy.co.uk", "inpdgroup.co.uk", "inpdgrowth.co.uk", "inpdprofessional.co.uk", "inpdlearners.co.uk", "inpdcareers.co.uk", "inpdskills.co.uk", "inpdpartners.co.uk", "inpdsolutions.co.uk", "inpdconnect.co.uk", "inpdconsulting.co.uk", "inpdeducation.co.uk", "inpddevelopment.co.uk", "inpdexec.co.uk", "inpddirector.co.uk", "inpdtalent.co.uk", "inpdaccelerate.co.uk", "inpdprofessionals.co.uk", "inpdtransform.co.uk", "inpdcourses.co.uk"];

// IPS tag to change domains to
const newIPSTag = '123-REG';

async function logFailedDomain(domain) {
    const logFile = path.join(__dirname, 'failed_domains.txt');
    const logEntry = `${domain}\n`;

    try {
        await fs.appendFile(logFile, logEntry);
        console.log(`Logged failed domain: ${domain}`);
    } catch (error) {
        console.error(`Error logging failed domain: ${error}`);
    }
}

async function login() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    const login = 'resellersf'
    const password = 'GnD3733V7ow5-'

    await page.goto('https://cp.enom.com/login.aspx');
    await page.type('#ctl00_Main_loginid', login);
    await page.type('#ctl00_Main_txtpassword', password);
    await page.click('#ctl00_Main_BtnLogin');

    // eNom asks for 2FA, script will wait for you to enter auth info
    console.log('Please complete the 2FA process manually.');
    console.log('Once you have successfully logged in, press Enter in this console to continue.');

    // When auth info is entered just press enter in cmd line
    await new Promise(resolve => process.stdin.once('data', resolve));

    console.log('Authentication completed. Closing browser...');

    const cookies = await page.cookies();
    await browser.close();

    return cookies;
}

async function changeIPSTag(page, domain, newIPSTag) {
    let dialogHandled = false;  // Flag to check if dialog is handled

    try {
        console.log(`Attempting to change IPS tag for ${domain}`);

        // Navigate to Domain Manager page
        await page.goto('https://cp.enom.com/domains/Domain-Manager.aspx');
        console.log('Navigated to Domain Manager page');

        // Wait for search input to be available
        await page.waitForSelector('#ctl00_Main_ctl01_txtQSearch', { timeout: 20000 });
        console.log('Search input field found');

        // Clear input field and search for domain
        await page.$eval('#ctl00_Main_ctl01_txtQSearch', el => el.value = '');
        await page.type('#ctl00_Main_ctl01_txtQSearch', domain);
        console.log(`Typed domain: ${domain} into search field`);

        await page.click('#ctl00_Main_ctl01_btnQuickSearch');
        console.log('Clicked search button');

        await page.waitForNavigation({ timeout: 30000 });
        console.log('Page navigated after search');

        // Extract DomainNameID from search results
        const domainNameId = await page.evaluate((domain) => {
            const link = Array.from(document.querySelectorAll('a')).find(el => el.textContent.includes(domain));
            if (link) {
                const match = link.href.match(/DomainNameID=(\d+)/);
                return match ? match[1] : null;
            }
            return null;
        }, domain);

        if (!domainNameId) {
            throw new Error(`Could not find DomainNameID for ${domain}`);
        }

        console.log(`Found DomainNameID: ${domainNameId}`);

        // Navigate to General Settings page
        await page.goto(`https://cp.enom.com/domains/control-panel/default.aspx?DomainNameID=${domainNameId}`);
        console.log('Navigated to Control Panel');

        // Click the General Settings link
        await page.waitForSelector('a[href*="GeneralMain.aspx"]', { timeout: 30000 });
        await page.evaluate((domainNameId) => {
            const link = Array.from(document.querySelectorAll('a')).find(el => el.href.includes(`GeneralMain.aspx?DomainNameID=${domainNameId}`));
            if (link) {
                link.click();
            } else {
                throw new Error('General Settings link not found');
            }
        }, domainNameId);
        console.log('Clicked General Settings link');

        await waitForTimeout(2000);

        // Wait for RegistrarTag input to be available
        await page.waitForSelector('#RegistrarTag', { timeout: 30000 });
        console.log('RegistrarTag input found');

        // Clear IPS tag field and enter new value
        await page.$eval('#RegistrarTag', el => el.value = '');
        await page.type('#RegistrarTag', newIPSTag);
        console.log(`Typed new IPS tag: ${newIPSTag}`);

        // Remove any dialog handlers to avoid conflicts
        page.removeAllListeners('dialog');

        // Set up dialog handler to accept alert
        page.on('dialog', async (dialog) => {
            if (!dialogHandled) {
                console.log('Alert detected:', dialog.message());
                await dialog.accept();
                console.log('Alert accepted');
                dialogHandled = true;  // Set the flag to indicate dialog has been handled
            } else {
                console.log('Alert already handled');
            }
        });

        // Wait for Send button to be clickable
        await page.waitForSelector('a[href="javascript:ChangeTag();"]', { visible: true, timeout: 30000 });
        console.log('Send button is visible and clickable');

        // Click send button
        await page.evaluate(() => {
            const sendButton = document.querySelector('a[href="javascript:ChangeTag();"]');
            if (sendButton) {
                sendButton.click();
            } else {
                throw new Error('Send button not found or not clickable');
            }
        });
        console.log('Clicked Send button');

        // Wait for alert to be handled
        await waitForTimeout(4000);

        // Navigate back to Domain Manager page
        await page.goto('https://cp.enom.com/domains/Domain-Manager.aspx');
        console.log('Navigated back to Domain Manager page');

    } catch (error) {
        console.error(`Error processing ${domain}:`, error);
        const currentUrl = await page.url();
        console.log(`Current page URL: ${currentUrl}`);
        await logFailedDomain(domain);
        throw error;
    }
}


async function processDomainslist(domains, newIPSTag) {
    try {
        const cookies = await login();
        const browser = await puppeteer.launch({headless: true});
        const page = await browser.newPage();
        await page.setCookie(...cookies);

        console.log('Continuing with automated tasks with browser closed...');

        for (const domain of domains) {
            try {
                await changeIPSTag(page, domain, newIPSTag);
                console.log(`Successfully processed ${domain}`);
            } catch (error) {
                console.error(`Failed to change IPS tag for ${domain}:`, error);
            }
        }

        await browser.close();
    } catch (error) {
        console.error('An error occurred during the process:', error);
    } finally {
        process.exit(0);
    }
}

// Run script
processDomainslist(domains, newIPSTag).then(() => {
    console.log('Script has finished executing.');
    console.log('Ending session...');
}).catch((error) => {
    console.error('An error occurred:', error);
}).finally(() => {
    process.exit(0);
});