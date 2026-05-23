class DevMode {
	private ENABLED: boolean = false;

	setEnabled(enabled: boolean) {
		this.ENABLED = enabled;
	}

	IS_ENABLED(): boolean {
		return this.ENABLED;
	}
}

const generateUID = (mapId: string, obj: any): string => {
	return `${mapId}:${obj.id}:${obj.x}:${obj.y}`;
};

enum DebugColor {
	RED = "\u001b[1;31m",
	GREEN = "\u001b[1;32m",
	YELLOW = "\u001b[1;33m",
	BLUE = "\u001b[1;34m",
	PURPLE = "\u001b[1;35m",
	CYAN = "\u001b[1;36m",
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const DEV_MODE = new DevMode();
// Currently debugging, enable dev mode by default
DEV_MODE.setEnabled(true);
