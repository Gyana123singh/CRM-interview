import axios from "axios";
import * as cheerio from "cheerio";
import * as https from "https";

export class WebsiteScraperService {
  constructor() {
    this.axiosInstance = axios.create({
      timeout: 8000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      maxRedirects: 5,
    });
  }

  /**
   * Scrape business homepage and potential contact pages
   */
  async scrape(url) {
    if (!url || !url.startsWith("http")) {
      return { contacts: [], socialLinks: {}, html: "", headers: {} };
    }

    const contacts = [];
    const socialLinks = {};
    let homepageHtml = "";
    let responseHeaders = {};

    try {
      const response = await this.axiosInstance.get(url);
      homepageHtml = response.data;
      responseHeaders = response.headers;

      const $ = cheerio.load(homepageHtml);

      this.extractContactsFromHtml($, url, "homepage", contacts, socialLinks);

      const linksToFollow = [];
      $("a").each((_, el) => {
        const href = $(el).attr("href");
        if (!href) return;

        const resolved = this.resolveUrl(url, href);
        if (!resolved) return;

        const lowerHref = href.toLowerCase();
        if (
          (lowerHref.includes("contact") || lowerHref.includes("about") || lowerHref.includes("reach")) &&
          !linksToFollow.includes(resolved) &&
          resolved !== url
        ) {
          linksToFollow.push(resolved);
        }
      });

      const subpagesToScan = linksToFollow.slice(0, 2);
      for (const pageUrl of subpagesToScan) {
        try {
          const subRes = await this.axiosInstance.get(pageUrl);
          const sub$ = cheerio.load(subRes.data);
          const sourceName = pageUrl.replace(url, "");
          this.extractContactsFromHtml(sub$, pageUrl, sourceName, contacts, socialLinks);
        } catch (subErr) {
          console.debug(`Failed to scan subpage ${pageUrl}:`, subErr);
        }
      }
    } catch (err) {
      console.error(`Failed to scrape website ${url}:`, err.message || err);
    }

    return {
      contacts,
      socialLinks,
      html: homepageHtml,
      headers: responseHeaders,
    };
  }

  extractContactsFromHtml(
    $,
    pageUrl,
    source,
    contacts,
    socialLinks
  ) {
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const json = JSON.parse($(el).html() || "");
        this.extractFromJsonLd(json, source, contacts, socialLinks);
      } catch {
      }
    });

    const ogEmail = $('meta[property="og:email"]').attr("content");
    if (ogEmail && this.isValidEmail(ogEmail)) {
      contacts.push({ type: "email", value: ogEmail.toLowerCase().trim(), source });
    }

    const ogPhone = $('meta[property="og:phone_number"]').attr("content") || $('meta[name="phone"]').attr("content");
    if (ogPhone) {
      contacts.push({ type: "phone", value: ogPhone.trim(), source });
    }

    $("a").each((_, el) => {
      const href = $(el).attr("href")?.trim();
      const text = $(el).text().trim();
      if (!href) return;

      if (href.startsWith("mailto:")) {
        const email = href.substring(7).split("?")[0].trim().toLowerCase();
        if (this.isValidEmail(email)) {
          contacts.push({ type: "email", value: email, name: text || undefined, source });
        }
      }

      if (href.startsWith("tel:")) {
        const phone = href.substring(4).split("?")[0].trim();
        if (phone.length > 5) {
          contacts.push({ type: "phone", value: phone, name: text || undefined, source });
        }
      }

      this.detectSocialProfile(href, socialLinks);
    });

    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,24}/g;
    const bodyText = $("body").text();
    let match;

    while ((match = emailRegex.exec(bodyText)) !== null) {
      const email = match[0].toLowerCase().trim();
      if (this.isValidEmail(email) && !contacts.some((c) => c.value === email)) {
        contacts.push({ type: "email", value: email, source: `${source} (plaintext)` });
      }
    }
  }

  extractFromJsonLd(json, source, contacts, socialLinks) {
    if (!json) return;

    if (Array.isArray(json)) {
      json.forEach((item) => this.extractFromJsonLd(item, source, contacts, socialLinks));
      return;
    }

    if (json.sameAs) {
      const urls = Array.isArray(json.sameAs) ? json.sameAs : [json.sameAs];
      urls.forEach((url) => this.detectSocialProfile(url, socialLinks));
    }

    if (json.email) {
      const email = String(json.email).replace("mailto:", "").trim().toLowerCase();
      if (this.isValidEmail(email)) {
        contacts.push({ type: "email", value: email, source: `${source} (json-ld)` });
      }
    }

    if (json.telephone) {
      contacts.push({ type: "phone", value: String(json.telephone).trim(), source: `${source} (json-ld)` });
    }

    if (json.contactPoint) {
      this.extractFromJsonLd(json.contactPoint, source, contacts, socialLinks);
    }
  }

  detectSocialProfile(url, socialLinks) {
    try {
      const lower = url.toLowerCase();
      if (lower.includes("facebook.com/") || lower.includes("fb.com/")) {
        socialLinks.facebook = url;
      } else if (lower.includes("instagram.com/") || lower.includes("instagr.am/")) {
        socialLinks.instagram = url;
      } else if (lower.includes("linkedin.com/")) {
        socialLinks.linkedin = url;
      } else if (lower.includes("twitter.com/") || lower.includes("x.com/")) {
        socialLinks.twitter = url;
      } else if (lower.includes("youtube.com/") || lower.includes("youtu.be/")) {
        socialLinks.youtube = url;
      }
    } catch {
    }
  }

  resolveUrl(base, relative) {
    try {
      if (relative.startsWith("http")) return relative;
      if (relative.startsWith("//")) return `https:${relative}`;
      const url = new URL(relative, base);
      return url.toString();
    } catch {
      return null;
    }
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && !email.endsWith(".png") && !email.endsWith(".jpg") && !email.endsWith(".webp") && !email.endsWith(".gif");
  }
}
