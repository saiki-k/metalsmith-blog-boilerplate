import metalsmith from 'metalsmith';
import collections from 'metalsmith-collections';
import markdown from 'metalsmith-markdown';
import permalinks from 'metalsmith-permalinks';
import layouts from 'metalsmith-layouts';
import assets from 'metalsmith-assets-improved';
import drafts from 'metalsmith-drafts';
import updated from 'metalsmith-updated';
import tags from 'metalsmith-tags';

const build = () => {
    const options = {
        collections: {
            writings: {
                pattern: 'writings/**/*.md',
                sortBy: 'date',
                reverse: true, 
            },
            pages: {
                pattern: 'pages/**/*.md',
                refer: false,
            },
        },
        markdown: {
            gfm: true,
            tables: true,
        },
        // TODO: Handle assets through a different build tool like gulp, for minification
        assets: {
            source: 'src/assets',
            destination: 'build/assets',
        },
        // TODO
        permalinks: {},
    };
    
    metalsmith(__dirname)
        .source('src')
        .use(drafts())
        .use(collections(options.collections))
        .use(markdown(options.markdown))
        .use(updated())
        .use(assets(options.assets))
        .use(permalinks(options.permalinks))
        .use(layouts())
        // TODO
        // .use(tags())
        .destination('build');
        .build(err => {
            if (err) {
                console.error(err);
                throw err;
            }
        })
};

build();