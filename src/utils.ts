import {
    TJsonaIncludeNamesChain,
    TJsonaNormalizedIncludeNamesTree
} from './JsonaTypes';

export function createIncludeNamesTree(
    namesChain: TJsonaIncludeNamesChain,
    includeTree: TJsonaNormalizedIncludeNamesTree,
): void {
    const namesArray = namesChain.split('.');
    const currentIncludeName = namesArray.shift();
    const chainHasMoreNames = namesArray.length;

    let subTree = null;

    if (chainHasMoreNames) {
        subTree = includeTree[currentIncludeName] || {};
        createIncludeNamesTree(namesArray.join('.'), subTree);
    }

    includeTree[currentIncludeName] = subTree;
}

export function jsonParse(stringified: string): Object {
    let parsed;

    try {
        parsed = JSON.parse(stringified);
    } catch (e) {
        parsed = {};
        console.warn(e);
    }

    return parsed;
}