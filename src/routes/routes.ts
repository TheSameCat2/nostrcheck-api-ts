import { Application } from "express";
import { logger } from "../lib/logger.js";
import config from "config";

import { loadNostraddressEndpoint } from "./nostraddress.route.js";
import { loadMediaEndpoint } from "./media.route.js";
import { loadLightningaddressEndpoint } from "./lightningaddress.route.js";
import { loadVerifyEndpoint } from "./verify.route.js";
import { loadRegisterEndpoint } from "./register.route.js";
import { loadDomainsEndpoint } from "./domains.route.js";
import { loadAdminEndpoint } from "./admin.route.js";
import { loadFrontendEndpoint } from "./frontend.route.js";

//Load API endpoints
const LoadAPI = async (app: Application, version:string): Promise<boolean> => {

	logger.debug("Loading API endpoints", "version: " + version);

	for (const endpoint in app.get("activeEndpoints")) {

		logger.debug("Loading endpoint: " + endpoint + " version: " + version)
		switch (endpoint) {
			case "nostraddress":
				await loadNostraddressEndpoint(app, version);
				break;
			case "media":
				await loadMediaEndpoint(app, version);
				break;
			case "lightning":
				await loadLightningaddressEndpoint(app, version);
				break;
			case "verify":
				await loadVerifyEndpoint(app, version);
				break;
			case "register":
				await loadRegisterEndpoint(app, version);
				break;
			case "domains":
				await loadDomainsEndpoint(app, version);
				break;
			case "admin":
				await loadAdminEndpoint(app, version);
				break;
			case "frontend":
				await loadFrontendEndpoint(app, version);
				break;
			default:
				logger.warn("Unknown endpoint: " + endpoint);
				break;
		}
	}

	return true;
};


export { LoadAPI };
