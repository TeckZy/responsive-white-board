import * as d3 from 'd3';

export class WhiteboardOptions {
	color = '#000000';
	backgroundColor = '#ffffff';
	size = '5px';
	linejoin: 'miter' | 'round' | 'bevel' | 'miter-clip' | 'arcs' = 'round';
	linecap: 'butt' | 'square' | 'round' = 'round';
}

export interface ActionStack {
	type: ActionType;
	line?: SVGPathElement;
	image?: SVGGElement;
}

export enum ActionType {
	Line,
	Image
}
export class Mode {
	type: 'write' | 'erace';
}

export const curveTypes = [
	{
		name: 'curveLinear',
		curve: d3.curveLinear,
		active: true,
		lineString: '',
		clear: false,
		info: 'Interpolates the points using linear segments.'
	},
	{
		name: 'curveBasis',
		curve: d3.curveBasis,
		active: true,
		lineString: '',
		clear: true,
		info:
			'Interpolates the start and end points and approximates the inner points using a B-spline.'
	},
	{
		name: 'curveBasisClosed',
		curve: d3.curveBasisClosed,
		active: false,
		lineString: '',
		clear: false,
		info: 'Uses a closed B-Spline to approximate the points.'
	},
	{
		name: 'curveBundle (ß=0)',
		curve: d3.curveBundle.beta(0),
		active: false,
		lineString: '',
		clear: true,
		info:
			'Same as curveBasis with the addition of a paramter ß which determines how close to a straight line the curve is. If ß=0 the curve is straight.'
	},
	{
		name: 'curveBundle (ß=0.5)',
		curve: d3.curveBundle.beta(0.5),
		active: false,
		lineString: '',
		clear: false,
		info:
			'Same as curveBasis with the addition of a paramter ß which determines how close to a straight line the curve is.'
	},
	{
		name: 'curveBundle (ß=1)',
		curve: d3.curveBundle.beta(1),
		active: false,
		lineString: '',
		clear: false,
		info:
			'Same as curveBasis with the addition of a paramter ß which determines how close to a straight line the curve is. If ß=1 the curve is the same as curveBasis.'
	},
	{
		name: 'curveCardinal (tension=0)',
		curve: d3.curveCardinal.tension(0),
		active: false,
		lineString: '',
		clear: true,
		info:
			"Interpolates the points using a cubic B-spline. A tension parameter determines how 'taut' the curve is. As tension approaches 1 the segments become linear."
	},
	{
		name: 'curveCardinal (tension=0.5)',
		curve: d3.curveCardinal.tension(0.5),
		active: false,
		lineString: '',
		clear: false,
		info:
			"Interpolates the points using a cubic B-spline. A tension parameter determines how 'taut' the curve is. As tension approaches 1 the segments become linear."
	},
	{
		name: 'curveCardinal (tension=1)',
		curve: d3.curveCardinal.tension(1),
		active: false,
		lineString: '',
		clear: false,
		info:
			"Interpolates the points using a cubic B-spline. A tension parameter determines how 'taut' the curve is. As tension approaches 1 the segments become linear."
	},
	{
		name: 'curveCatmullRom (α=0)',
		curve: d3.curveCatmullRom.alpha(0),
		active: false,
		lineString: '',
		clear: true,
		info:
			'Similar to curveCardinal (tension=0) but with a parameter α that determines the parameterisation used to interpolate the points. If α=0 the parameterisation is uniform.'
	},
	{
		name: 'curveCatmullRom (α=0.5)',
		curve: d3.curveCatmullRom.alpha(0.5),
		active: false,
		lineString: '',
		clear: false,
		info:
			'Similar to curveCardinal (tension=0) but with a parameter α that determines the parameterisation used to interpolate the points. If α=0.5 the parameterisation is centripetal and self intersecting loops are avoided.'
	},
	{
		name: 'curveCatmullRom (α=1)',
		curve: d3.curveCatmullRom.alpha(1),
		active: false,
		lineString: '',
		clear: false,
		info:
			'Similar to curveCardinal (tension=0) but with a parameter α that determines the parameterisation used to interpolate the points. If α=1 the parameterisation is chordal.'
	},
	{
		name: 'curveMonotoneX',
		curve: d3.curveMonotoneX,
		active: false,
		lineString: '',
		clear: true,
		info:
			'Interpolates the points with a cubic spline which are monotonic (i.e. always increasing or always decreasing) in y.'
	},
	{
		name: 'curveMonotoneY',
		curve: d3.curveMonotoneY,
		active: false,
		lineString: '',
		clear: false,
		info:
			'Interpolates the points with a cubic spline which are monotonic (i.e. always increasing or always decreasing) in x.'
	},
	{
		name: 'curveNatural',
		curve: d3.curveNatural,
		active: false,
		lineString: '',
		clear: true,
		info:
			'Interpolates the points with a cubic spline with zero 2nd derivatives at the endpoints.'
	},
	{
		name: 'curveStep',
		curve: d3.curveStep,
		active: false,
		lineString: '',
		clear: true,
		info:
			'Interpolates the points with alternating horizontal and vertical linear segments. The vertical segments lie midway between points.'
	},
	{
		name: 'curveStepAfter',
		curve: d3.curveStepAfter,
		active: false,
		lineString: '',
		clear: false,
		info:
			'Interpolates the points with alternating horizontal and vertical linear segments. The y value changes after the x value.'
	},
	{
		name: 'curveStepBefore',
		curve: d3.curveStepBefore,
		active: false,
		lineString: '',
		clear: false,
		info:
			'Interpolates the points with alternating horizontal and vertical linear segments. The y value changes before the x value.'
	}
];

export const strokesType = {
	stroke: '',
	'stroke-width': '',
	'stroke-linecap': '',
	'stroke-dasharray': ''
};
