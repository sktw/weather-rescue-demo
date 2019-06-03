import React from 'react';
import PropTypes from 'prop-types';
import {scale, getRotationMatrix, getInverseRotationMatrix, multiplyMatrixVector, multiplyMatrixMatrix} from '../geometry';
import {setViewerSize} from '../actions/viewer';
import {setImageMetadata} from '../actions/image';

function getSvgMatrix(transform) {
    // https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/transform#Matrix
    const [[a, c, tx], [b, d, ty]] = transform;
    return `matrix(${a},${b},${c},${d},${tx},${ty})`;
}

class ImageViewer extends React.Component {
    constructor(props) {
        super(props);
        this.viewerRef = null;
        this.handleResize = this.handleResize.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
    }

    render() {
        const {zoomScale, imageSize, img} = this.props;
        const transform = this.getTransform();
        const [width, height] = scale(imageSize, zoomScale);
        const [svgWidth, svgHeight] = this.getSvgSize();

        const viewBox = `0 0 ${svgWidth} ${svgHeight}`;

        return (
            <div 
                className="viewer" 
                ref={el => this.viewerRef = el} 
                style={{cursor: this.getCursor()}}
                onKeyDown={this.handleKeyDown} 
                onKeyUp={this.handleKeyUp} 
                onMouseDown={this.handleMouseDown} 
                tabIndex="0"
            >
                <svg width={svgWidth} height={svgHeight} viewBox={viewBox}>
                    <g transform={getSvgMatrix(transform)}>
                        <image width={width} height={height} xlinkHref={img.src} />
                        {this.renderView()}
                    </g>
                </svg>
                {this.props.children}
            </div>
        );
    }

    getSvgSize() {
        const {rotation, imageSize, zoomScale} = this.props;
        const [width, height] = imageSize;
        const dimensions = (rotation % 2 === 0) ? [width, height] : [height, width];
        return scale(dimensions, zoomScale);
    }

    renderView() {
    }

    componentDidMount() {
        this.handleResize();

        window.addEventListener('mouseup', this.handleMouseUp, false);
        window.addEventListener('resize', this.handleResize, false);

        const {imageSize} = this.props;
        const svgSize = this.getSvgSize();
        const imageMetadata = {
            naturalWidth: imageSize[0],
            naturalHeight: imageSize[1],
            clientWidth: svgSize[0],
            clientHeight: svgSize[1]
        };

        this.props.dispatch(setImageMetadata(imageMetadata));
    }

    componentWillUnmount() {
        window.removeEventListener('mouseup', this.handleMouseUp);
        window.removeEventListener('resize', this.handleResize);
    }

    addMouseMoveHandler() {
        this.viewerRef.addEventListener('mousemove', this.handleMouseMove, false);
    }

    removeMouseMoveHandler() {
        this.viewerRef.removeEventListener('mousemove', this.handleMouseMove);
    }

    getTransform() {
        const {zoomScale, imageSize, pan, rotation} = this.props;
        const [px, py] = pan;
        const rotationMatrix = getRotationMatrix(rotation, scale(imageSize, zoomScale));
        const translationMatrix = [[1, 0, zoomScale * px], [0, 1, zoomScale * py]];

        return multiplyMatrixMatrix(rotationMatrix, translationMatrix);
    }

    getInverseTransform() {
        const {zoomScale, imageSize, pan, rotation} = this.props;
        const [px, py] = pan;
        const inverseRotationMatrix = getInverseRotationMatrix(rotation, scale(imageSize, zoomScale));
        const inverseTranslationMatrix = [[1, 0, -zoomScale * px], [0, 1, -zoomScale * py]];

        return multiplyMatrixMatrix(inverseTranslationMatrix, inverseRotationMatrix);
    }

    getCursor() {
        return 'auto';
    }

    getMousePos(e) {
        const {zoomScale} = this.props;
        const rect = this.viewerRef.getBoundingClientRect();
        let pos = [e.clientX - rect.left, e.clientY - rect.top];
        const inverseTransform = this.getInverseTransform();
        pos = multiplyMatrixVector(inverseTransform, pos);
        return scale(pos, 1 / zoomScale);
    }

    getMouseDelta(e, direction = null) {
        const {zoomScale} = this.props;
        let delta;
        
        switch (direction) {
            case 'horizontal':
                delta = [e.movementX, 0];
                break;
            case 'vertical':
                delta = [0, e.movementY];
                break;
            default:
                delta = [e.movementX, e.movementY];
                break;
        }

        const inverseTransform = this.getInverseTransform();
        inverseTransform[0][2] = 0;
        inverseTransform[1][2] = 0;
        delta = multiplyMatrixVector(inverseTransform, delta);
        return scale(delta, 1 / zoomScale);
    }

    handleResize() {
        const size = this.getViewerSize();
        this.props.dispatch(setViewerSize(size));
    }

    handleKeyDown() {
    }

    handleKeyUp() {
    }

    handleMouseDown() {
    }

    handleMouseUp() {
    }

    handleMouseMove() {
    }

    getViewerSize() {
        // return size of viewer
        return [this.viewerRef.clientWidth, this.viewerRef.clientHeight];
    }
}

ImageViewer.propTypes = {
    img: PropTypes.instanceOf(Element).isRequired,
    imageSize: PropTypes.arrayOf(PropTypes.number).isRequired,
    zoomScale: PropTypes.number.isRequired,
    zoomToCenter: PropTypes.bool,
    rotation: PropTypes.number.isRequired,
    pan: PropTypes.arrayOf(PropTypes.number).isRequired,
    dispatch: PropTypes.func.isRequired,
    children: PropTypes.element
};

export default ImageViewer;
