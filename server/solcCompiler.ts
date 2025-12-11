// server/solcCompiler.ts
// Compilador Solidity real usando solc-js

// @ts-ignore - solc doesn't have type definitions
import solc from 'solc';

export interface CompilationError {
  severity: 'error' | 'warning';
  message: string;
  formattedMessage?: string;
  sourceLocation?: {
    file: string;
    start: number;
    end: number;
  };
}

export interface CompiledContract {
  contractName: string;
  abi: any[];
  bytecode: string;
  deployedBytecode: string;
  gasEstimates?: {
    creation: { codeDepositCost: string; executionCost: string; totalCost: string };
    external: Record<string, string>;
  };
}

export interface CompilationResult {
  success: boolean;
  contracts: CompiledContract[];
  errors: CompilationError[];
  warnings: CompilationError[];
}

// OpenZeppelin imports resolver (simplified - returns empty for now)
// In production, you would fetch these from node_modules or a CDN
function resolveImport(path: string): { contents: string } | { error: string } {
  // For OpenZeppelin imports, we'll use a simplified approach
  // The actual contracts are already in node_modules from hardhat setup
  
  if (path.startsWith('@openzeppelin/')) {
    // Return a placeholder - in production, read from node_modules
    return { error: `Import ${path} not resolved. Use flattened contracts or configure import resolver.` };
  }
  
  return { error: `File not found: ${path}` };
}

export function compileSolidity(sourceCode: string, contractFileName: string = 'Contract.sol'): CompilationResult {
  const input = {
    language: 'Solidity',
    sources: {
      [contractFileName]: {
        content: sourceCode
      }
    },
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode', 'evm.deployedBytecode', 'evm.gasEstimates']
        }
      }
    }
  };

  let output;
  try {
    output = JSON.parse(solc.compile(JSON.stringify(input), { import: resolveImport }));
  } catch (err: any) {
    return {
      success: false,
      contracts: [],
      errors: [{ severity: 'error', message: `Compilation failed: ${err.message}` }],
      warnings: []
    };
  }

  const errors: CompilationError[] = [];
  const warnings: CompilationError[] = [];

  // Process errors and warnings
  if (output.errors) {
    for (const error of output.errors) {
      const compError: CompilationError = {
        severity: error.severity as 'error' | 'warning',
        message: error.message,
        formattedMessage: error.formattedMessage,
        sourceLocation: error.sourceLocation
      };

      if (error.severity === 'error') {
        errors.push(compError);
      } else {
        warnings.push(compError);
      }
    }
  }

  // If there are errors, return early
  if (errors.length > 0) {
    return {
      success: false,
      contracts: [],
      errors,
      warnings
    };
  }

  // Extract compiled contracts
  const contracts: CompiledContract[] = [];
  
  if (output.contracts && output.contracts[contractFileName]) {
    for (const [contractName, contractData] of Object.entries(output.contracts[contractFileName])) {
      const data = contractData as any;
      contracts.push({
        contractName,
        abi: data.abi || [],
        bytecode: data.evm?.bytecode?.object ? `0x${data.evm.bytecode.object}` : '',
        deployedBytecode: data.evm?.deployedBytecode?.object ? `0x${data.evm.deployedBytecode.object}` : '',
        gasEstimates: data.evm?.gasEstimates
      });
    }
  }

  return {
    success: contracts.length > 0,
    contracts,
    errors,
    warnings
  };
}

// Compile a simple contract without external imports
export function compileSimpleContract(sourceCode: string): CompilationResult {
  // Check if source has OpenZeppelin imports
  const hasOZImports = sourceCode.includes('@openzeppelin/');
  
  if (hasOZImports) {
    // For contracts with OZ imports, we need to use a different approach
    // Return a helpful message
    return {
      success: false,
      contracts: [],
      errors: [{
        severity: 'error',
        message: 'Este contrato usa imports do OpenZeppelin. Para compilar, use o Hardhat CLI: npx hardhat compile'
      }],
      warnings: [{
        severity: 'warning',
        message: 'Dica: Você pode usar os templates pré-compilados disponíveis na página de Templates.'
      }]
    };
  }

  return compileSolidity(sourceCode);
}

// Validate Solidity syntax without full compilation
export function validateSolidityQuick(sourceCode: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Basic syntax checks
  if (!sourceCode.includes('pragma solidity')) {
    errors.push('Missing pragma solidity statement');
  }

  if (!sourceCode.includes('contract ') && !sourceCode.includes('interface ') && !sourceCode.includes('library ')) {
    errors.push('No contract, interface, or library definition found');
  }

  // Check for common syntax errors
  const openBraces = (sourceCode.match(/{/g) || []).length;
  const closeBraces = (sourceCode.match(/}/g) || []).length;
  if (openBraces !== closeBraces) {
    errors.push(`Mismatched braces: ${openBraces} opening, ${closeBraces} closing`);
  }

  const openParens = (sourceCode.match(/\(/g) || []).length;
  const closeParens = (sourceCode.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    errors.push(`Mismatched parentheses: ${openParens} opening, ${closeParens} closing`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Extract contract names from source code
export function extractContractNamesFromSource(sourceCode: string): string[] {
  const contractRegex = /(?:contract|interface|library)\s+(\w+)/g;
  const names: string[] = [];
  let match;

  while ((match = contractRegex.exec(sourceCode)) !== null) {
    names.push(match[1]);
  }

  return names;
}

// Generate TypeScript types from ABI
export function generateTypesFromABI(contractName: string, abi: any[]): string {
  let output = `// Auto-generated TypeScript types for ${contractName}\n\n`;
  
  output += `export interface ${contractName}Contract {\n`;
  
  for (const item of abi) {
    if (item.type === 'function') {
      const inputs = item.inputs?.map((i: any) => `${i.name}: ${solidityToTsType(i.type)}`).join(', ') || '';
      const outputs = item.outputs?.length > 0 
        ? item.outputs.length === 1 
          ? solidityToTsType(item.outputs[0].type)
          : `[${item.outputs.map((o: any) => solidityToTsType(o.type)).join(', ')}]`
        : 'void';
      
      output += `  ${item.name}(${inputs}): Promise<${outputs}>;\n`;
    }
  }
  
  output += `}\n`;
  
  return output;
}

function solidityToTsType(solidityType: string): string {
  if (solidityType.startsWith('uint') || solidityType.startsWith('int')) {
    return 'bigint';
  }
  if (solidityType === 'address') {
    return 'string';
  }
  if (solidityType === 'bool') {
    return 'boolean';
  }
  if (solidityType === 'string') {
    return 'string';
  }
  if (solidityType.startsWith('bytes')) {
    return 'string';
  }
  if (solidityType.endsWith('[]')) {
    const baseType = solidityType.slice(0, -2);
    return `${solidityToTsType(baseType)}[]`;
  }
  return 'any';
}
