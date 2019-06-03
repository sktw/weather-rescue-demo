import React from 'react';
import PropTypes from 'prop-types';
import {extendPropTypes, renderWithProps} from './componentUtils';

import {scale, rectMidpoints, rectScale} from '../geometry';

const HIT_TOLERENCE = 5;

class Item extends React.Component {
    constructor(props) {
        super(props);
        this.handleMouseDown = this.handleMouseDown.bind(this);
    }

    handleMouseDown() {
        this.props.onHit(this);
    }

    renderItem() {
        return null;
    }

    renderShape() {
        return null;
    }

    renderChildren() {
        return null;
    }

    render() {
        return (
            <g>
                {this.renderItem()}
                {renderWithProps(this.renderShape(), {
                    onMouseDown: this.handleMouseDown
                })}
                {this.renderChildren()}
            </g>
        );
    }
}

Item.propTypes = {
    zoomScale: PropTypes.number.isRequired,
    onHit: PropTypes.func.isRequired
};

export class ControlPointItem extends Item {
    constructor(props) {
        super(props);
    }
    
    renderItem() {
        const {pos, zoomScale} = this.props;
        const [x, y] = scale(pos, zoomScale);
        const r = 4;
        
        return (
            <rect 
                x={x - r} 
                y={y - r} 
                width={2 * r} 
                height={2 * r} 
                stroke="red" 
                fill="transparent" 
                strokeWidth="2" 
            />
        );
    }

    renderShape() {
        const {pos, zoomScale} = this.props;
        const [x, y] = scale(pos, zoomScale);
        const r = 4;
        const s = r + HIT_TOLERENCE;
        
        return (
            <rect 
                x={x - s} 
                y={y - s} 
                width={2 * s} 
                height={2 * s} 
                stroke="none" 
                fill="transparent" 
            />
        );
    }
}

ControlPointItem.propTypes = extendPropTypes(Item.propTypes, {
    id: PropTypes.string,
    parentItem: PropTypes.object.isRequired,
    pos: PropTypes.arrayOf(PropTypes.number).isRequired,
});
                
export class RectItem extends Item {
    constructor(props) {
        super(props);
    }

    renderItem() {
        const {rect, zoomScale} = this.props;
        const [[x0, y0], [x1, y1]] = rectScale(rect, zoomScale);

        return (
            <rect 
                x={x0} 
                y={y0} 
                width={x1 - x0} 
                height={y1 - y0} 
                stroke="red" 
                fill="none" 
                strokeWidth="2" 
            />
        );
    }

    renderChildren() {
        const {showControlPoints, rect, zoomScale, onHit} = this.props;
        const midpoints = rectMidpoints(rect);

        if (showControlPoints) {
            return (
                <g>
                    <ControlPointItem id="h0" parentItem={this} pos={midpoints[0]} zoomScale={zoomScale} onHit={onHit} />
                    <ControlPointItem id="h1" parentItem={this} pos={midpoints[1]} zoomScale={zoomScale} onHit={onHit} />
                    <ControlPointItem id="v0" parentItem={this} pos={midpoints[2]} zoomScale={zoomScale} onHit={onHit} />
                    <ControlPointItem id="v1" parentItem={this} pos={midpoints[3]} zoomScale={zoomScale} onHit={onHit} />
                </g>
            );
        }
        else {
            return null;
        }
    }


    renderShape() {
        const {rect, zoomScale} = this.props;
        const [[x0, y0], [x1, y1]] = rectScale(rect, zoomScale);

        return (
            <rect
                x={x0}
                y={y0}
                width={x1 - x0}
                height={y1 - y0}
                stroke="transparent"
                fill="none"
                strokeWidth={2 * HIT_TOLERENCE}
            />
        );
    }
}

RectItem.propTypes = extendPropTypes(Item.propTypes, {
    id: PropTypes.string.isRequired,
    rect: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
    showControlPoints: PropTypes.bool
});


export class LineItem extends Item {
    constructor(props) {
        super(props);
    }

    renderItem() {
        const {line, zoomScale} = this.props;
        const [p, q] = line;
        const [x0, y0]  = scale(p, zoomScale);
        const [x1, y1] = scale(q, zoomScale);
        
        return (
            <line 
                x1={x0} 
                y1={y0} 
                x2={x1}
                y2={y1}
                stroke="red" 
                fill="none" 
                strokeWidth="2" 
            />
        );
    }

    renderChildren() {
        const {line, zoomScale, showControlPoints, onHit} = this.props;
        const [p0, p1] = line;

        if (showControlPoints) {
            return (
                <g>
                    <ControlPointItem id="p0" parentItem={this} pos={p0} zoomScale={zoomScale} onHit={onHit} />
                    <ControlPointItem id="p1" parentItem={this} pos={p1} zoomScale={zoomScale} onHit={onHit} />
                </g>
            );
        }
        else {
            return null;
        }
    }

    renderShape() {
        const {line, zoomScale} = this.props;
        const [[x0, y0], [x1, y1]] = rectScale(line, zoomScale);
        return (
            <line 
                x1={x0} 
                y1={y0} 
                x2={x1}
                y2={y1}
                stroke="transparent" 
                fill="none" 
                strokeWidth={2 * HIT_TOLERENCE} 
            />
        );
    }
}

LineItem.propTypes = extendPropTypes(Item.propTypes, {
    id: PropTypes.string.isRequired,
    line: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
    showControlPoints: PropTypes.bool
});
