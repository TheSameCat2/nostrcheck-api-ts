import config from "config";
import fs from "fs";
import { exit } from "process";

const defaultPath : string = "./config/default.json";
const localPath : string = "./config/local.json";
import { IModules } from "../interfaces/config.js";

function prepareAppFolders(){

	// tempPath checks
	let tempPath : string = config.get("media.tempPath");
	if(!tempPath){
		console.error("TempPath is not defined in config file.");
		exit(1);
	}

	if (!fs.existsSync(tempPath)){
		fs.mkdirSync(tempPath);
	}

	fs.readdir(tempPath, (err, files) => {
		if (err) {
			console.error(err);
            exit(1);
		}

		//Delete all files in temp folder
		for (const file of files) {
			fs.unlink(tempPath + file, (err) => {
				if (err) {
                    console.error(err);
                    exit(1);
				}
			});
		}
	});

	// mediaPath checks
	const mediaPath : string = config.get("media.mediaPath");
	if (!mediaPath){
		console.error("MediaPath is not defined in config file.");
		exit(1);
	}
	if (!fs.existsSync(mediaPath)){
		fs.mkdirSync(mediaPath);
	}

}

async function prepareAPPConfig(): Promise<boolean>{

	if (fs.existsSync(localPath)){
		await syncDefaultConfigValues(defaultPath,localPath);
		await checkConfigNecessaryKeys();
		return true;
	}else{
		fs.copyFile(defaultPath, localPath, function (err) {
			if (err) {
				console.error("An error occured while writing config JSON File.", err);
				exit(1);
			}
		
			console.info("Creating local config file: " + localPath)
			console.warn("Please edit config file and then restart the app.")
			exit(1);
    	});
	}

	return false;

}

const checkConfigNecessaryKeys = async () : Promise<void> => {
	
	const necessaryKeys = [	"server.host", 
							"server.port", 
							"server.pubkey", 
							"server.secretKey", 
							"server.tosFilePath", 
							"database.host",
							"database.user",
							"database.password",
							"database.database"
						]
	let localConfig = JSON.parse(fs.readFileSync(localPath).toString());
	let missingFields = [];

	for (const key of necessaryKeys){
		if (config.get(key) === undefined || config.get(key) === ""){
			missingFields.push(key);
		}
	}

	if (missingFields.length > 0){
		console.error(" ------------------------------------------------------------ ")
		console.error("|  Empty necessary fields in local config file.              |")
		console.error("|  Please edit config file and then restart the app.         |")
		console.error("|  Execute: nano config/local.json                           |")
		console.error(" ------------------------------------------------------------ ")
		console.error(" For more information visit:")
		console.error(" https://github.com/quentintaranpino/nostrcheck-api-ts/blob/main/configuration.md") 
		console.error(" ")
		console.error(" Missing fields: ");
		missingFields.forEach((field) => {
			console.error(" " + field);
		});
		console.error(" ")
		exit(1);
	}

}

const syncDefaultConfigValues = async (defaultConf : string, localConf: string) : Promise<void> => {

	//Compare default config with local config json files
	const DefaultConfig = JSON.parse(fs.readFileSync(defaultConf).toString());
	const LocalConfig = JSON.parse(fs.readFileSync(localConf).toString());
	
	let configChanged = await mergeConfigkey(DefaultConfig, LocalConfig);
	if (!configChanged) return;
	
	try{
		console.debug("Updating config file: " + localConf)
		fs.copyFileSync(localConf, localConf + ".bak");
		fs.writeFileSync(localConf, JSON.stringify(LocalConfig, null, 4));
	}catch(err){
		console.error("Error writing config file: ", err);
	}
	
};

let hasChanged = false;

const mergeConfigkey = async (defaultConfig: any, localConfig: any): Promise<boolean> => {

    const promises = [];

    for (const key in defaultConfig) {
        if (typeof defaultConfig[key] === 'object' && defaultConfig[key] !== null && !Array.isArray(defaultConfig[key])) {
            if (!localConfig[key]){
                localConfig[key] = {};
                hasChanged = true;
            }
            promises.push(mergeConfigkey(defaultConfig[key], localConfig[key]));
        } else if (!localConfig.hasOwnProperty(key)) {
            localConfig[key] = defaultConfig[key];
            console.warn("Missing config key: " + key + " - Adding default value:", defaultConfig[key]);
            hasChanged = true;
        }
    }

    await Promise.all(promises);
    return hasChanged;
}

const updateLocalConfigKey = async (key: string, value: any) : Promise<boolean> => {
	
	const LocalConfig = JSON.parse(fs.readFileSync(localPath).toString());

	//If key is nested
	if (key.includes(".")){
		const keyArray = key.split(".");
		LocalConfig[keyArray[0]][keyArray[1]] = value;
	}else{
		LocalConfig[key] = value;
	}

	try{
		console.debug("Updating config file: " + localPath + " with key: " + key + " and value: " + value)
		fs.copyFileSync(localPath, localPath + ".bak");
		fs.writeFileSync(localPath, JSON.stringify(LocalConfig, null, 4));

		return true;

	}catch(err){
		console.error("Error writing config file: ", err);
		return false;
	}

}

// Load enabled API modules for runtime
const loadconfigModules = async () : Promise<IModules> => {

	const configModules: IModules = config.get("server.availableModules");
	let runtimeModules: IModules = {};

	for (const module in configModules) {
		for (const [key, value] of Object.entries(configModules[module])) {

			if (key === "enabled" && value === true) {
				runtimeModules[module] = configModules[module];
			}
		}
	}
	return runtimeModules;
}

async function prepareAPP() {
    await prepareAPPConfig();
	await prepareAppFolders();
}

export { updateLocalConfigKey, loadconfigModules, prepareAPP };
