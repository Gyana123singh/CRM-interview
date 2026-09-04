import * as cheerio from "cheerio";

export class CmsDetectionService {
  /**
   * Detect CMS platform and related web technologies
   */
  detect(html, headers = {}) {
    if (!html) {
      return { cms: "Custom CMS", technologies: [] };
    }

    const $ = cheerio.load(html);
    const htmlLower = html.toLowerCase();
    const detectedTech = new Set();
    let cms = "Custom CMS";

    const headersLower = {};
    for (const [key, value] of Object.entries(headers)) {
      headersLower[key.toLowerCase()] = String(value).toLowerCase();
    }

    if (
      headersLower["x-shopify-stage"] ||
      headersLower["x-shopify-shop-id"] ||
      htmlLower.includes("cdn.shopify.com") ||
      htmlLower.includes("shopify.theme") ||
      htmlLower.includes("shopify-pay")
    ) {
      cms = "Shopify";
      detectedTech.add("Shopify");
      detectedTech.add("Shopify CDN");
    }
    else if (
      htmlLower.includes("wp-content/") ||
      htmlLower.includes("wp-includes/") ||
      htmlLower.includes("wp-json/") ||
      $('meta[name="generator"]').attr("content")?.toLowerCase().includes("wordpress")
    ) {
      cms = "WordPress";
      detectedTech.add("WordPress");
      
      if (htmlLower.includes("woocommerce") || $(".woocommerce").length > 0 || htmlLower.includes("wp-content/plugins/woocommerce")) {
        detectedTech.add("WooCommerce");
      }
    }
    else if (
      htmlLower.includes("wixpress") ||
      htmlLower.includes("wix.com") ||
      $('meta[name="generator"]').attr("content")?.toLowerCase().includes("wix") ||
      html.includes('id="wix-')
    ) {
      cms = "Wix";
      detectedTech.add("Wix");
    }
    else if (
      htmlLower.includes("static1.squarespace.com") ||
      htmlLower.includes("squarespace.com") ||
      headersLower["x-squarespace-redirect"] ||
      $("body").attr("id")?.startsWith("collection-") ||
      htmlLower.includes("use squarespace")
    ) {
      cms = "Squarespace";
      detectedTech.add("Squarespace");
    }
    else if (
      htmlLower.includes("data-wf-site") ||
      htmlLower.includes("w-container") ||
      $('meta[name="generator"]').attr("content")?.toLowerCase().includes("webflow")
    ) {
      cms = "Webflow";
      detectedTech.add("Webflow");
    }
    else if (
      htmlLower.includes("godaddy.com") ||
      htmlLower.includes("secureserver.net") ||
      $('meta[name="generator"]').attr("content")?.toLowerCase().includes("godaddy")
    ) {
      cms = "GoDaddy";
      detectedTech.add("GoDaddy Website Builder");
    }
    else if (
      htmlLower.includes("sites.google.com") ||
      htmlLower.includes("googlesites") ||
      htmlLower.includes("google-site-verification")
    ) {
      cms = "Google Sites";
      detectedTech.add("Google Sites");
    }
    else if (
      htmlLower.includes("/media/jui/") ||
      htmlLower.includes("com_content") ||
      $('meta[name="generator"]').attr("content")?.toLowerCase().includes("joomla")
    ) {
      cms = "Joomla";
      detectedTech.add("Joomla");
    }
    else if (
      htmlLower.includes("drupal.org") ||
      headersLower["x-generator"]?.includes("drupal") ||
      $('meta[name="generator"]').attr("content")?.toLowerCase().includes("drupal")
    ) {
      cms = "Drupal";
      detectedTech.add("Drupal");
    }
    else if (
      htmlLower.includes("mage/cookies.js") ||
      htmlLower.includes("/skin/frontend/") ||
      htmlLower.includes("magento")
    ) {
      cms = "Magento";
      detectedTech.add("Magento");
    }

    if (htmlLower.includes("google-analytics.com/analytics.js") || htmlLower.includes("googletagmanager.com/gtag/js")) {
      detectedTech.add("Google Analytics");
    }

    if (htmlLower.includes("googletagmanager.com/gtm.js")) {
      detectedTech.add("Google Tag Manager");
    }

    if (htmlLower.includes("connect.facebook.net")) {
      detectedTech.add("Facebook Pixel");
    }

    if (htmlLower.includes("tailwind") || htmlLower.includes("theme.screens") || htmlLower.includes("theme.colors")) {
      detectedTech.add("Tailwind CSS");
    }

    if (htmlLower.includes("bootstrap.min.css") || htmlLower.includes("bootstrap.min.js") || htmlLower.includes('class="row"')) {
      detectedTech.add("Bootstrap CSS");
    }

    if (htmlLower.includes("react-dom") || htmlLower.includes("react.development") || htmlLower.includes("_react")) {
      detectedTech.add("React");
    }

    if (htmlLower.includes("__next_data__") || htmlLower.includes("/_next/static/")) {
      detectedTech.add("Next.js");
      cms = "Next.js";
    }

    if (htmlLower.includes("jquery.min.js") || htmlLower.includes("jquery-") || htmlLower.includes("jquery.js")) {
      detectedTech.add("jQuery");
    }

    if (headersLower["server"]?.includes("cloudflare") || headersLower["cf-ray"] || htmlLower.includes("cloudflare-static")) {
      detectedTech.add("Cloudflare");
    }

    if (htmlLower.includes("font-awesome") || htmlLower.includes("fontawesome") || htmlLower.includes("fa-icons")) {
      detectedTech.add("FontAwesome");
    }

    if (htmlLower.includes("elementor-widget") || htmlLower.includes("elementor-container")) {
      detectedTech.add("Elementor Builder");
    }

    return {
      cms,
      technologies: Array.from(detectedTech),
    };
  }
}
