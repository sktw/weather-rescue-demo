import {Item} from './scene';
import {add, subtract, equal, rectSize, rectMidpoints, rectNormalize, rectContainsPoint, rectExpand, rectTranslate} from '../geometry';
import {SUBTOOL_TYPES} from '../actions/subjectViewer';

const HIT_TOLERENCE = 5;

export class ControlPointItem extends Item {
    constructor(parnt, pos) {
        super(parnt);
        this.pos = pos;
        this.zIndex = 2;
    }

    draw(ctx) {
        const pos = this.scene.toScene(this.pos);
        const r = 4;
        ctx.save();
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.rect(pos[0] - r, pos[1] - r, 2 * r, 2 * r);
        ctx.stroke();
        ctx.restore()
    }

    moveBy(delta) {
        this.parnt.moveControlPointBy(this, delta);
    }

    hitTest(pt) {
        const r = 4;
        const rect = rectExpand([this.pos, this.pos], [r + HIT_TOLERENCE, r + HIT_TOLERENCE]);
        return rectContainsPoint(rect, pt);
    }
}

export class LineItem extends Item {
    constructor(pt0, pt1, subTool) {
        super();

        this.item0 = new ControlPointItem(this, pt0);
        this.item1 = new ControlPointItem(this, pt1);

        this.children = [this.item0, this.item1];

        switch (subTool) {
            case SUBTOOL_TYPES.ANNOTATE.EDIT:
                this.showControlPoints(true);
                break;
            default:
                this.showControlPoints(false);
        }

        this.zIndex = 1;
    }

    showControlPoints(sense) {
        this.children.forEach(item => item.setVisible(sense));
    }

    isEmpty() {
        return equal(this.item0.pos, this.item1.pos);
    }

    getLine() {
        return [this.item0.pos, this.item1.pos];
    }

    moveBy(delta) {
        this.children.forEach(item => item.pos = add(item.pos, delta));
    }

    draw(ctx) {
        const [x0, y0] = this.scene.toScene(this.item0.pos);
        const [x1, y1] = this.scene.toScene(this.item1.pos);

        ctx.save();
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x0, y0)
        ctx.lineTo(x1, y1);
        ctx.stroke();
        ctx.restore()
    }

    moveControlPointBy(item, delta) {
        item.pos = add(item.pos, delta);
    }

    hitTest(pt) {
        // take item0 as origin, shift pt and item1
        const [x1, y1] = subtract(this.item1.pos, this.item0.pos);
        const [x2, y2] = subtract(pt, this.item0.pos);

        // compute rotation parameters

        const l = Math.sqrt(x1 * x1 + y1 * y1);
        const c = x1 / l;
        const s = y1 / l;

        // under rotation, item1 is moved to x-axis
        // compute location of pt under same rotation

        const x3 = c * x2 + s * y2;
        const y3 = -s * x2 + c * y2;

        // test rectangle along x-axis of width l and height 0, expanded by HIT_TOLERENCE

        const rect = rectExpand([[0, 0], [l, 0]], [HIT_TOLERENCE, HIT_TOLERENCE]);
        return rectContainsPoint(rect, [x3, y3]);
    }
}

export class RectItem extends Item {
    constructor(tl, br, subTool) {
        super();
        this.rect = [tl, br];
        const midpoints = rectMidpoints(this.rect);

        this.tItem =  new ControlPointItem(this, midpoints[0]);
        this.bItem = new ControlPointItem(this, midpoints[1]);
        this.lItem = new ControlPointItem(this, midpoints[2]);
        this.rItem = new ControlPointItem(this, midpoints[3]);

        this.children = [this.tItem, this.bItem, this.lItem, this.rItem];

        switch (subTool) {
            case SUBTOOL_TYPES.ANNOTATE.EDIT:
                this.showControlPoints(true);
                break;
            default:
                this.showControlPoints(false);
        }

        this.zIndex = 1;
    }

    showControlPoints(sense) {
        this.children.forEach(item => item.setVisible(sense));
    }

    isEmpty() {
        const [tl, br] = this.rect;
        return equal(tl, br);
    }

    getRect() {
        return this.rect;
    }

    setRect(rect) {
        this.rect = rectNormalize(rect);
        const midpoints = rectMidpoints(this.rect);

        this.tItem.pos = midpoints[0];
        this.bItem.pos = midpoints[1];
        this.lItem.pos = midpoints[2];
        this.rItem.pos = midpoints[3];
   }

    moveBy(delta) {
        this.rect = rectTranslate(this.rect, delta);
        this.children.forEach(item => item.pos = add(item.pos, delta));
    }

    draw(ctx) {
        const [tl] = this.rect;
        const [x0, y0] = this.scene.toScene(tl);
        const [w, h] = this.scene.sizeToScene(rectSize(this.rect));

        ctx.save();
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.rect(x0, y0, w, h);
        ctx.stroke();
        ctx.restore()
    }

    moveControlPointBy(item, delta) {
        const [dx, dy] = delta;

        if (item === this.lItem || item === this.rItem) {
            item.pos = add(item.pos, [dx, 0]); 
        }
        else {
            item.pos = add(item.pos, [0, dy]); 
        }

        const x0 = this.lItem.pos[0];
        const x1 = this.rItem.pos[0];
        const y0 = this.tItem.pos[1];
        const y1 = this.bItem.pos[1];

        if (x0 > x1) {
            const temp = this.lItem;
            this.lItem = this.rItem;
            this.rItem = temp;
        }

        if (y0 > y1) {
            const temp = this.tItem;
            this.tItem = this.bItem;
            this.bItem = temp;
        }

        this.setRect([[x0, y0], [x1, y1]]);
    }

    hitTest(pt) {
        const outer = rectExpand(this.rect, [HIT_TOLERENCE, HIT_TOLERENCE]);
        const inner = rectExpand(this.rect, [-HIT_TOLERENCE, -HIT_TOLERENCE]);
        return rectContainsPoint(outer, pt) && !rectContainsPoint(inner, pt);
    }
}
