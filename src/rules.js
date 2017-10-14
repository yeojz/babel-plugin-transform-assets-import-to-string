const defaultOptions = {
  cwd: true,
  alias: [],
  extensions: ['.gif', '.jpeg', '.jpg', '.png', '.svg'],
}

function formatOptions(opts) {
  const options = Object.assign({}, defaultOptions, opts);

  if (options.cwd) {
    const cwd = process.cwd();
    options.alias = options.alias.map((entry) => {
      entry.to = `${cwd}${entry.to}`;
      return entry;
    });
  }

  return options;
}

function rules() {
  let options = null;

  return (state, ext) => {
    if (!options) {
      options = formatOptions(state.opts);
    }

    if (options.extensions.indexOf(ext) >= 0) {
      return options.alias;
    }

    return [];
  }
}

export default rules();
