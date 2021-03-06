import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Mode } from './constants';

@Injectable({
	providedIn: 'root'
})
export class WhiteboardService {
	// Observable string sources
	private eraseSvgMethodCallSource = new Subject<any>();
	private saveSvgMethodCallSource = new Subject<{
		name: string;
		format: 'png' | 'jpeg' | 'svg';
	}>();
	private undoSvgMethodCallSource = new Subject<any>();
	private redoSvgMethodCallSource = new Subject<any>();
	private deleteModeSvgMethodCallSource = new Subject<any>();
	private addImageMethodCallSource = new Subject<string | ArrayBuffer>();
	private penChangeCallSource = new Subject<any>();

	// Observable string streams
	eraseSvgMethodCalled$ = this.eraseSvgMethodCallSource.asObservable();
	saveSvgMethodCalled$ = this.saveSvgMethodCallSource.asObservable();
	undoSvgMethodCalled$ = this.undoSvgMethodCallSource.asObservable();
	redoSvgMethodCalled$ = this.redoSvgMethodCallSource.asObservable();
	addImageMethodCalled$ = this.addImageMethodCallSource.asObservable();
	penChangeCallcalled$ = this.penChangeCallSource.asObservable();

	//Name is Mis Leading
	deleteModeSvgMethodCalled$ = this.deleteModeSvgMethodCallSource.asObservable();

	// Service message commands
	public erase(): void {
		this.eraseSvgMethodCallSource.next();
	}
	public writeDeleteMode(mode: Mode) {
		this.deleteModeSvgMethodCallSource.next(mode);
	}
	public save(
		name: string = 'New image',
		format: 'png' | 'jpeg' | 'svg' = 'png'
	): void {
		this.saveSvgMethodCallSource.next({ name, format });
	}
	public undo(): void {
		this.undoSvgMethodCallSource.next();
	}
	public redo(): void {
		this.redoSvgMethodCallSource.next();
	}
	public addImage(image: string | ArrayBuffer): void {
		this.addImageMethodCallSource.next(image);
	}
	public changePen(fucntionRef: any): void {
		this.penChangeCallSource.next(fucntionRef);
	}
}
