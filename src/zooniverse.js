import {config} from './config';

export function getUrl(href) {
    return config.zooniverseLinks.projectLinkBase + href;
}

export function getTalkUrl(subjectHref) {
    return getUrl('/talk' + subjectHref);
}
