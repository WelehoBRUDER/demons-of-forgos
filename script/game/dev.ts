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

const DEV_MODE = new DevMode();
// Currently debugging, enable dev mode by default
DEV_MODE.setEnabled(true);
