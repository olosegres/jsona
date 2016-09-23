
export default function isIncludeTree(some: any): boolean {
    if (!some) {
        return false;
    }

    if (some.slice && some.slice instanceof Function) {
        return false;
    }

    if (!Object.keys(some).length) {
        return false;
    }

    return true;
}
