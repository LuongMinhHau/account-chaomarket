export const processTagDisplay = (
    tag: 'Chào Connect' | 'Free Courses' | 'Workshops' | string
) => {
    switch (tag) {
        case 'Chào Connect':
            return 'chao-connect';
        case 'Free Courses':
            return 'free-courses';
        case 'Workshops':
            return 'workshops';
        default:
            return 'chao-connect';
    }
};

export const processTagValue = (tag: string) => {
    switch (tag) {
        case 'chao-connect':
            return 'Chào Connect';
        case 'free-courses':
            return 'Free Courses';
        case 'workshops':
            return 'Workshops';
    }
};
