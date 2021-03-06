import {
	Component,
	AfterViewInit,
	ViewChild,
	Input,
	ElementRef,
	Output,
	EventEmitter,
	OnChanges,
	OnDestroy
} from '@angular/core';
import { WhiteboardService } from './whiteboard.service';
import { Subscription } from 'rxjs';
import {
	WhiteboardOptions,
	ActionStack,
	ActionType,
	Mode,
	curveTypes
} from './constants';
import {
	ContainerElement,
	curveBasis,
	select,
	drag,
	Selection,
	line,
	event,
	mouse,
	curveLinear,
	curveBasisClosed,
	curveBundle
} from 'd3';

@Component({
	selector: 'white-board',
	templateUrl: './white-board.component.html',
	styleUrls: ['./white-board.component.scss']
})
export class WhiteBoardComponent
	implements AfterViewInit, OnDestroy, OnChanges {
	@ViewChild('svgContainer', { static: false })
	private svgContainer: ElementRef<ContainerElement>;
	@Input() whiteboardOptions: WhiteboardOptions = new WhiteboardOptions();
	@Input() color: string;
	@Input() size: string;
	@Input() backgroundColor: string;
	@Input() height: number = 1000;
	@Input() width: number = 1000;
	@Input() curveType;
	@Input() linejoin: 'miter' | 'round' | 'bevel' | 'miter-clip' | 'arcs';
	@Input() linecap: 'butt' | 'square' | 'round';

	@Output() init = new EventEmitter();
	@Output() clear = new EventEmitter();
	@Output() undo = new EventEmitter();
	@Output() redo = new EventEmitter();
	@Output() save = new EventEmitter<string | Blob>();
	@Output() imageAdded = new EventEmitter();
	@Output() modeChage = new EventEmitter<Mode>();
	mode = true;

	private selection: Selection<any, unknown, null, undefined> = undefined;

	private subscriptionList: Subscription[] = [];

	private undoStack: ActionStack[] = [];
	private redoStack: ActionStack[] = [];
	private currentStack: ActionStack[] = [];

	constructor(private whiteboardService: WhiteboardService) {}
	ngOnChanges(): void {
		if (this.selection)
			this.selection = this.initSvg(this.svgContainer.nativeElement);
	}

	ngAfterViewInit() {
		/*
		Handle Subscription
	*/

		this.subscriptionList.push(
			this.whiteboardService.eraseSvgMethodCalled$.subscribe(() =>
				this.eraseSvg(this.selection)
			)
		);
		this.subscriptionList.push(
			this.whiteboardService.deleteModeSvgMethodCalled$.subscribe(
				(mode: Mode) => this.switchMode(mode)
			)
		);

		this.subscriptionList.push(
			this.whiteboardService.saveSvgMethodCalled$.subscribe(
				({ name, format }) => this.saveSvg(name, format)
			)
		);
		this.subscriptionList.push(
			this.whiteboardService.penChangeCallcalled$.subscribe((el) => {
				this.selection = this.initSvg(this.svgContainer.nativeElement);
			})
		);
		this.subscriptionList.push(
			this.whiteboardService.undoSvgMethodCalled$.subscribe(() =>
				this.undoDraw()
			)
		);
		this.subscriptionList.push(
			this.whiteboardService.redoSvgMethodCalled$.subscribe(() =>
				this.redoDraw()
			)
		);
		this.subscriptionList.push(
			this.whiteboardService.addImageMethodCalled$.subscribe((image) =>
				this.addImage(image)
			)
		);

		this.selection = this.initSvg(this.svgContainer.nativeElement);
		console.log(this.selection);
	}

	ngOnDestroy(): void {
		this.subscriptionList.forEach((subscription) =>
			this._unsubscribe(subscription)
		);
	}

	private initSvg(selector: ContainerElement) {
		console.log('kkk');
		console.log('init');
		const d3Line = line().curve(this.curveType);
		const svg = select(selector).call(
			drag()
				.container(selector)
				.subject(() => {
					const p = [event.x, event.y];
					return [p, p];
				})
				.on('start', () => {
					const d = event.subject;
					const active = svg

						.append('path')
						.datum(d)
						.attr('class', 'line')
						.attr(
							'style',
							`
           fill: none;
           stroke: ${
				this.mode
					? this.color || this.whiteboardOptions.color
					: this.backgroundColor
			};
           stroke-width: ${this.size || this.whiteboardOptions.size};
           stroke-linejoin: ${this.linejoin || this.whiteboardOptions.linejoin};
           stroke-linecap: ${this.linecap || this.whiteboardOptions.linecap};
           `
						);
					console.log(this.mode);
					active.attr('d', d3Line);
					event.on('drag', function (d) {
						const k = mouse(this);
						const el = select(this).node().getBoundingClientRect();
						if (k[0] <= el.width && k[1] <= el.height) {
							active.datum().push(k);
							active.attr('d', d3Line);
						}
					});
					event.on('end', () => {
						active.attr('d', d3Line);
						if (this.undoStack.length < 1) {
							this.redoStack = [];
						}
						this.undoStack.push({
							type: ActionType.Line,
							line: active.node()
						});
					});
				})
		);
		this.init.emit();
		return svg;
	}

	private addImage(image: string | ArrayBuffer) {
		console.log('addImage');
		this.drawImage(image);
	}

	private eraseSvg(svg: Selection<any, unknown, null, undefined>) {
		console.log('erasesvg');
		svg.selectAll('*').remove();
		this.undoStack = [];
		this.redoStack = [];
		this.clear.emit();
	}

	private saveSvg(name, format: 'png' | 'jpeg' | 'svg') {
		console.log('SaveSvg');
		const svgString = this.saveAsSvg(this.selection.clone(true).node());
		if (format === 'svg') {
			this.download(
				'data:image/svg+xml;base64,' +
					btoa(unescape(encodeURIComponent(svgString))),
				name
			);
		} else {
			this.svgString2Image(
				svgString,
				Number(this.selection.style('width').replace('px', '')),
				Number(this.selection.style('height').replace('px', '')),
				format,
				(img) => {
					this.download(img, name);
				}
			);
		}

		this.save.emit();
	}

	private undoDraw() {
		console.log('Undo');
		if (!this.undoStack.length) {
			return;
		}
		this.redoStack.push(this.undoStack.pop());
		this.selection.selectAll('.line').remove();
		this.undoStack.forEach((action) => {
			if (action.type === ActionType.Line) {
				this.drawLine(action.line);
			} else if (action.type === ActionType.Image) {
				this.drawLine(action.image);
			}
		});
		this.undo.emit();
	}

	private redoDraw() {
		console.log('redoF');
		if (!this.redoStack.length) {
			return;
		}
		this.undoStack.push(this.redoStack.pop());
		this.selection.selectAll('.line').remove();
		this.undoStack.forEach((action) => {
			if (action.type === ActionType.Line) {
				this.drawLine(action.line);
			} else if (action.type === ActionType.Image) {
				this.drawLine(action.image);
			}
		});
		this.redo.emit();
	}

	private drawLine(pathNode: SVGPathElement | SVGGElement) {
		this.selection.node().appendChild(pathNode);
	}

	private drawImage(image: string | ArrayBuffer) {
		console.log('DrwaImage');
		const group = this.selection
			.append('g')
			.data([{ x: 20, y: 20, r: 1, scale: 1 }])
			.attr('x', 0)
			.attr('y', 0)
			.attr('transform', 'translate(0,0)');

		group
			.append('image')
			.attr('x', 0)
			.attr('y', 0)
			.attr('height', this.selection.style('height'))
			.attr('preserveAspectRatio', 'none')
			.attr('xlink:href', image.toString());

		group
			.append('rect')
			.attr('x', 0)
			.attr('y', 0)
			.attr('width', 20)
			.attr('height', 20)
			.style('opacity', 0)
			.attr('fill', (d) => {
				return '#cccccc';
			})
			.call(
				drag()
					.subject(() => {
						const p = [event.x, event.y];
						return [p, p];
					})
					.on('start', () => {
						event.on('drag', function (d) {
							const cursor = select(this);
							const cord = mouse(this);

							d.x += cord[0] - Number(cursor.attr('width')) / 2;
							d.y += cord[1] - Number(cursor.attr('height')) / 2;
							select(this.parentNode).attr('transform', () => {
								return (
									'translate(' +
									[d.x, d.y] +
									'),rotate(' +
									d.r +
									',160, 160),scale(' +
									d.scale +
									',' +
									d.scale +
									')'
								);
							});
						});
					})
			);
		group
			.on('mouseover', function () {
				select(this).select('rect').style('opacity', 1.0);
			})
			.on('mouseout', function () {
				select(this).select('rect').style('opacity', 0);
			});

		// this.undoStack.push({ type: ActionType.Image, image: group.node() });
	}

	private _unsubscribe(subscription: Subscription): void {
		if (subscription) {
			subscription.unsubscribe();
		}
	}

	private svgString2Image(
		svgString: string,
		width: number,
		height: number,
		format: string,
		callback: (img: string) => void
	) {
		// set default for format parameter
		format = format || 'png';
		// SVG data URL from SVG string
		const svgData =
			'data:image/svg+xml;base64,' +
			btoa(unescape(encodeURIComponent(svgString)));
		// create canvas in memory(not in DOM)
		const canvas = document.createElement('canvas');
		// get canvas context for drawing on canvas
		const context = canvas.getContext('2d');
		// set canvas size
		canvas.width = width;
		canvas.height = height;
		// create image in memory(not in DOM)
		const image = new Image();
		// later when image loads run this
		image.onload = () => {
			// async (happens later)
			// clear canvas
			context.clearRect(0, 0, width, height);
			// draw image with SVG data to canvas
			context.drawImage(image, 0, 0, width, height);
			// snapshot canvas as png
			const pngData = canvas.toDataURL('image/' + format);
			// pass png data URL to callback
			callback(pngData);
		}; // end async
		// start loading SVG data into in memory image
		image.src = svgData;
	}

	private saveAsSvg(svgNode): string {
		svgNode.setAttribute('xlink', 'http://www.w3.org/1999/xlink');
		const serializer = new XMLSerializer();
		let svgString = serializer.serializeToString(svgNode);
		svgString = svgString.replace(/(\w+)?:?xlink=/g, 'xmlns:xlink='); // Fix root xlink without namespace
		svgString = svgString.replace(/NS\d+:href/g, 'xlink:href');
		return svgString;
	}

	private download(url: string, name: string): void {
		const link = document.createElement('a');
		link.href = url;
		link.setAttribute('visibility', 'hidden');
		link.download = name || 'new white-board';
		document.body.appendChild(link);
		link.click();
	}

	private saveLocal() {}
	/**
	 * Switch BetWeen The Write Mode and Read Mode
	 */
	private switchMode(mode: Mode) {
		this.mode = mode.type == 'write' ? true : false;
		this.modeChage.emit(mode);
	}
	/**
	 * Switch BetWeen The Write Mode and Read Mode
	 */
	isValidPoint(x, y) {
		const data = select(this.svgContainer.nativeElement).attr('width');

		console.log(data);
		// if (x < =  &&  y < =  )
	}
}
