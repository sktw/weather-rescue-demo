import React from 'react';
import PropTypes from 'prop-types';
import {Scene} from './scene';
import {scale, getRotationMatrix, getInverseRotationMatrix, multiplyMatrixVector, multiplyMatrixMatrix} from '../geometry';
import {setViewerSize} from '../actions/viewer';
import {setImageMetadata} from '../actions/image';

function getCssTransform(transform) {
    // https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/matrix
    const [[a, c, tx], [b, d, ty]] = transform;
    return `matrix(${a},${b},${c},${d},${tx},${ty})`;
}

class ImageViewer extends React.Component {
    constructor(props) {
        super(props);
        this.viewerRef = null;
        this.canvasRef = null;
        this.handlePan = this.handlePan.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
    }

    render() {
        const {zoomScale, imageSize} = this.props;
        const [width, height] = scale(imageSize, zoomScale);
        const transform = this.getTransform();

        const style = {
            cursor: this.getCursor(),
            transform: getCssTransform(transform),
            transformOrigin: "top left"
        }

        return (
            <div 
                className="viewer" 
                ref={el => this.viewerRef = el} 
                onKeyDown={this.handleKeyDown} 
                onKeyUp={this.handleKeyUp} 
                onMouseDown={this.handleMouseDown} 
                tabIndex="0"
            >
                <canvas 
                    width={width}
                    height={height} 
                    style={style} 
                    ref={el => this.canvasRef = el} 
                />
                {this.props.children}
            </div>
        );
    }

    renderScene() {
    }

    componentDidMount() {
        this.ctx = this.canvasRef.getContext('2d');
        this.scene = new Scene(this.ctx);
        this.renderScene();
        this.scene.update();

        this.handleResize();

        window.addEventListener('mouseup', this.handleMouseUp, false);
        window.addEventListener('resize', this.handleResize, false);

        const {imageSize} = this.props;
        const imageMetadata = {
            naturalWidth: imageSize[0],
            naturalHeight: imageSize[1],
            clientWidth: this.canvasRef.width,
            clientHeight: this.canvasRef.height
        };

        this.props.dispatch(setImageMetadata(imageMetadata));
    }

    componentWillUnmount() {
        window.removeEventListener('mouseup', this.handleMouseUp);
        window.removeEventListener('resize', this.handleResize);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.zoomScale !== this.props.zoomScale) {
            const {zoomScale} = this.props;
            this.scene.scale = zoomScale;
            this.scene.update();
        }
   }

    addMouseMoveHandler() {
        this.canvasRef.addEventListener('mousemove', this.handleMouseMove, false);
    }

    removeMouseMoveHandler() {
        this.canvasRef.removeEventListener('mousemove', this.handleMouseMove);
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
        const rect = this.viewerRef.getBoundingClientRect();
        const pos = [e.clientX - rect.left, e.clientY - rect.top];
        const inverseTransform = this.getInverseTransform();
        const scenePos = multiplyMatrixVector(inverseTransform, pos);
        return this.scene.fromView(scenePos);
    }

    getMouseDelta(e, direction = null) {
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
        const sceneDelta = multiplyMatrixVector(inverseTransform, delta);

        return this.scene.deltaFromView(sceneDelta);
    }

    handleResize() {
        const size = this.getViewerSize();
        this.props.dispatch(setViewerSize(size));
    }

    handlePan() {
        this.canvasRef.style.transform = getCssTransform(this.getTransform());
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

    getImageRect() {
        // return image tl and br
        return [[0, 0], this.props.imageSize];
    }
}

ImageViewer.propTypes = {
    imageSize: PropTypes.arrayOf(PropTypes.number).isRequired,
    zoomScale: PropTypes.number.isRequired,
    zoomToCenter: PropTypes.bool,
    rotation: PropTypes.number.isRequired,
    pan: PropTypes.arrayOf(PropTypes.number).isRequired,
    dispatch: PropTypes.func.isRequired,
    children: PropTypes.element
};

export default ImageViewer;
