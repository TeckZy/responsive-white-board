import { Component } from '@angular/core';
import { WhiteboardService } from './main/white-board/whiteboard.service';
import { Mode } from './main/white-board/constants';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {
	color = '#333333';
	backgroundColor = '#eee';
	size = '5px';
	isActive = false;
	currentMode = true;

	constructor(private whiteboardService: WhiteboardService) {}

	onInit() {
		console.log('Init!');
	}
	onClear() {
		console.log('Clear!');
	}
	onUndo() {
		console.log('Undo!');
	}
	onRedo() {
		console.log('Redo!');
	}
	onSave() {
		console.log('Save!');
	}
	onImageAded() {
		console.log('ImageAded!');
	}
	modeSwitch() {
		const value = new Mode();
		value.type = this.currentMode ? 'erace' : 'write';
		this.whiteboardService.writeDeleteMode(value);
	}
	onModeChange(ev: Mode) {
		this.currentMode = !this.currentMode;
	}

	erase() {
		this.whiteboardService.erase();
	}
	setSize(size) {
		this.size = size;
		this.isActive = false;
	}
	save() {
		this.whiteboardService.save();
	}
	undo() {
		this.whiteboardService.undo();
	}
	redo() {
		this.whiteboardService.redo();
	}
	addImage(fileInput) {
		const file = fileInput.files[0];
		const reader = new FileReader();

		reader.onloadend = () => {
			this.whiteboardService.addImage(reader.result);
		};

		if (file) {
			reader.readAsDataURL(file);
		}
	}
}
