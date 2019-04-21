import React from 'react';
import PropTypes from 'prop-types';
import {switchOn} from '../utils';
import {Scene} from './scene';
import {setZoomPercentage} from '../actions/viewer';
import {setImageMetadata} from '../actions/image';

const MARGIN = 0;

class ImageViewer extends React.Component {
    constructor(props) {
        super(props);
        this.viewerRef = null;
        this.canvasRef = null;
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleZoom = this.handleZoom.bind(this);
    }

    render() {
        return (
            <div className="viewer" ref={el => this.viewerRef = el} onKeyDown={this.handleKeyDown} onKeyUp={this.handleKeyUp} tabIndex="0">
                <canvas onMouseDown={this.handleMouseDown} style={{cursor: this.getCursor()}} ref={el => this.canvasRef = el} />
            </div>
        );
    }

    renderScene() {
    }

    componentDidMount() {
        this.ctx = this.canvasRef.getContext('2d');
        this.scene = new Scene(this.ctx);
        this.scene.origin = [MARGIN, MARGIN];
        this.scene.rotation = this.props.rotation;
        this.renderScene();
        this.scene.update();

        this.handleZoom();

        window.addEventListener('mouseup', this.handleMouseUp, false);
        window.addEventListener('resize', this.handleZoom, false);

        const {img} = this.props;
        const imageMetadata = {
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            clientWidth: this.canvasRef.width,
            clientHeight: this.canvasRef.height
        };

        this.props.dispatch(setImageMetadata(imageMetadata));
    }

    componentWillUnmount() {
        window.removeEventListener('mouseup', this.handleMouseUp);
        window.removeEventListener('resize', this.handleZoom);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.zoomValue !== this.props.zoomValue || prevProps.rotation !== this.props.rotation) {
            this.scene.rotation = this.props.rotation;
            this.handleZoom();
        }
    }

    addMouseMoveHandler() {
        this.canvasRef.addEventListener('mousemove', this.handleMouseMove, false);
    }

    removeMouseMoveHandler() {
        this.canvasRef.removeEventListener('mousemove', this.handleMouseMove);
    }

    getCursor() {
        return 'auto';
    }

    getMousePos(e) {
        const rect = this.canvasRef.getBoundingClientRect();
        return this.scene.fromView([e.clientX - rect.left, e.clientY - rect.top]);
    }

    getMouseDelta(e, direction=null) {
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
        
        return this.scene.deltaFromView(delta);
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

    scaleCanvas(scale) {
        let [width, height] = this.getFullSize();

        width = Math.floor(scale * width);
        height = Math.floor(scale * height);
        this.canvasRef.width = width;
        this.canvasRef.height = height;
    }

    getImageSize() {
        const {img} = this.props;
        return [img.naturalWidth, img.naturalHeight];
    }

    getFullSize() {
        // return full size of canvas, allowing for rotation

        const [width, height] = this.getImageSize();

        if (this.props.rotation % 2 === 0) {
            return [width + 2 * MARGIN, height + 2 * MARGIN];
        }
        else {
            return [height + 2 * MARGIN, width + 2 * MARGIN];
        }
    }

    getImageRect() {
        // return image tl and br
        const size = this.getImageSize();
        return [[0, 0], size];
    }

    handleZoom() {
        let zoomScale = 0;
        const {zoomValue} = this.props;
        const [width, height] = this.getFullSize();

        switchOn(zoomValue, {
            'actual-size': () => {
                zoomScale = 1.0;
                this.scaleCanvas(zoomScale);
            },

            'fit-height': () => {
                const containerWidth = this.viewerRef.clientWidth;
                const containerHeight = this.viewerRef.clientHeight;
                zoomScale = Math.min(Infinity, containerWidth / width, containerHeight / height);
                this.scaleCanvas(zoomScale);
            },

            'fit-width': () => {
                const containerWidth = this.viewerRef.clientWidth;
                zoomScale = containerWidth / width;
                this.scaleCanvas(zoomScale);
            },

            'default': () => {
                const percentage = parseInt(zoomValue);
                zoomScale = percentage / 100;
                this.scaleCanvas(zoomScale);
            }
        });

        // pass zoomValue back to toolbar so that it can handle zoom in/out
        const zoomPercentage = Math.round(zoomScale * 100);
        this.props.dispatch(setZoomPercentage(zoomValue, zoomPercentage));

        this.scene.scale = zoomScale;
        this.scene.update();
    }
}

ImageViewer.propTypes = {
    img: PropTypes.instanceOf(Element).isRequired,
    zoomValue: PropTypes.string.isRequired,
    rotation: PropTypes.number.isRequired,
    dispatch: PropTypes.func.isRequired
};

export default ImageViewer;
