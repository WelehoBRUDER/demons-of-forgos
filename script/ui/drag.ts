interface DragPositions {
	pos1: number;
	pos2: number;
}

class Drag {
	dragging: boolean = false;
	startX: number = 0;
	startY: number = 0;
	positions: DragPositions = { pos1: 0, pos2: 0 };
	click: boolean = false;
	mouseHeldTimeout: ReturnType<typeof setTimeout>;
	element: HTMLElement | null = null;
	snapContainers: HTMLElement[] = [];

	add(elem: HTMLElement, snapContainers?: HTMLElement[], onClick?: Function, onRelease?: Function) {
		const dragTimeout = snapContainers ? 200 : 0;
		this.snapContainers = snapContainers || [];
		elem.addEventListener("mousedown", (e: MouseEvent) => {
			this.click = true;
			clearTimeout(this.mouseHeldTimeout);
			this.element = elem;
			this.snapContainers = snapContainers || [];
			this.mouseHeldTimeout = setTimeout(() => this.dragMouse(), dragTimeout);
		});
		elem.addEventListener("mouseup", () => {
			clearTimeout(this.mouseHeldTimeout);
			this.element = null;
		});
	}

	dragMouse() {
		this.click = false;
		const { x: clientX, y: clientY } = game.getMousePosition();
		const rect = this.element!.getBoundingClientRect();
		this.positions.pos1 = clientX - rect.left;
		this.positions.pos2 = clientY - rect.top;
		//this.element!.style.position = "absolute";
		this.element!.style.zIndex = "1000";
		this.dragging = true;
	}

	dragElement(e: MouseEvent) {
		if (!this.element) return;
		e.preventDefault();
		this.element.style.left = `${e.clientX - this.positions.pos1}px`;
		this.element.style.top = `${e.clientY - this.positions.pos2}px`;
	}

	releaseElement(e: MouseEvent) {
		this.dragging = false;
		if (!this.element) return;
		this.element.style.zIndex = "20";
		this.resetElement();
	}

	resetElement(callback?: Function) {
		if (callback) callback();
		this.element = null;
		this.snapContainers = [];
		this.positions = { pos1: 0, pos2: 0 };
	}
}

const drag = new Drag();
