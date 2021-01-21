import * as nodePath from 'path';
import * as paths from 'tsconfig-paths';
import * as tsconfig from 'tsconfig-extends';
import Project from 'ts-simple-ast';

// ref: https://gist.github.com/rifler/39fdcd92e78505bbc94dc5b9f845292b
// use `tsconfig-extends` module cause it can recursively apply "extends" field
const compilerOptions = tsconfig.load_file_sync('./tsconfig.json');
const absoluteBaseUrl = nodePath.join(process.cwd(), compilerOptions.baseUrl);
const matchPathFunc = paths.createMatchPath(
  absoluteBaseUrl,
  compilerOptions.paths || {},
);
const project = new Project({ compilerOptions });

project.addExistingSourceFiles('./src/**/*.{ts,tsx}');

const sourceFiles = project.getSourceFiles();

sourceFiles.forEach(async sourceFile => {
  const importExportDeclarations = [
    ...sourceFile.getImportDeclarations(),
    ...sourceFile.getExportDeclarations(),
  ];
  const sourceFileAbsolutePath = sourceFile.getFilePath();
  let sourceFileWasChanged = false;

  for (const declaration of importExportDeclarations) {
    // if module seems like absolute
    if (!declaration.isModuleSpecifierRelative()) {
      const value = declaration.getModuleSpecifierValue();
      // try to find relative module for it
      const absolutePathToDepsModule = matchPathFunc(value);

      // and if relative module really exists
      if (absolutePathToDepsModule) {
        let resultPath = nodePath.relative(
          sourceFileAbsolutePath,
          absolutePathToDepsModule,
        );
        resultPath = resultPath
          .split('/')
          .slice(1)
          .join('/');

        // tslint:disable-next-line: no-console
        console.log(`${sourceFileAbsolutePath}: ${value} -> ${resultPath}`);

        // replace absolute to relative
        declaration.setModuleSpecifier(resultPath);
        sourceFileWasChanged = true;
      }
    }
  }

  if (sourceFileWasChanged) {
    await sourceFile.save();
  }
});
