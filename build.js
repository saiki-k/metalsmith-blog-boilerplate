import gatsby from 'gatsby';
import collections from 'gatsby-collections';
import markdown from 'gatsby-markdown';
import permalinks from 'gatsby-permalinks';
import layouts from 'gatsby-layouts';
import assets from 'gatsby-assets-improved';
import drafts from 'gatsby-drafts';
import updated from 'gatsby-updated';
import tags from 'gatsby-tags';

const build = () => {
    const options = {
        collections: {
            blog: {
                pattern: 'posts/**/*.md',
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
    
    gatsby(__dirname)
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