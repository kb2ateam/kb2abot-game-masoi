import fs from "fs"
import path from "path"
import url from "url"
import { Plugin } from "kb2abot"
import { gameManager } from "kb2abot-plugin-internal"
import {warn} from "kb2abot/util/logger"
import { readHJSON } from "kb2abot/util/common"
import MasoiGame from "./game"

export default class Masoi extends Plugin {
	package = JSON.parse(
		fs.readFileSync(new URL(url.resolve(
			import.meta.url, "../package.json")))
	);

	handleDatastore(rawConfig, rawUserdata) {
		const tempConf = readHJSON(url.fileURLToPath(path.join(import.meta.url, "../../config.template.hjson")))
		if (!rawConfig.version)
			return { config: tempConf, userdata: rawUserdata }
		if (rawConfig.version != tempConf.version) {
			warn(
				`Phien ban config hien tai [${rawConfig.version}] co the khong tuong thich voi ban [${tempConf.version}], vui long sua hoac xoa file config!`
			)
			return {
				config: {
					oldConfig: rawConfig,
					...tempConf
				},
				userdata: rawUserdata
			}
		}
		return {config: Object.assign(tempConf, rawConfig), userdata: rawUserdata}
	}

	// Called after this plugin is inited but before it has been enabled (like an async constructor)
	async load() {
		gameManager.register({ masoi: MasoiGame }, this)
		// const commands = []
		// for (const key in Command) commands.push(new Command[key]())
		// await this.commands.add(...commands)
	}

	// Called when this plugin is disabled
	async onDisable() {}

	// Called when this plugin is enabled
	async onEnable() {}
}

export { MasoiGame }
