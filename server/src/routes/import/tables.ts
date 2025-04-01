import express, { Request, Response } from 'express';
import { csvFileMappings, getAllDestinationTables } from '../../services/columnMappingService';

const router = express.Router();

/**
 * Get all available import tables with their metadata
 * @route GET /api/import/tables
 * @group Imports - CSV data import operations
 * @returns {object} 200 - List of available tables for import
 */
router.get('/tables', async (req: Request, res: Response) => {
  try {
    // Get all destination tables
    const allTables = getAllDestinationTables();
    
    // Transform into a more frontend-friendly format
    const tables = allTables.map(table => {
      // Find the parent mapping to determine if data or lookup table
      const parentMapping = csvFileMappings.find(mapping => 
        mapping.destinations.some(dest => dest.tableId === table.tableId)
      );
      
      return {
        tableName: table.tableName,
        tableId: table.tableId,
        category: parentMapping?.category || 'unknown',
        primaryKeys: table.primaryKeys,
        // Convert column mappings to a list of field information
        fields: table.columnMappings.map(col => ({
          name: col.dbColumn,
          csvColumn: col.csvColumn,
          hasTransform: !!col.transform,
          // Is this a primary key field?
          isPrimaryKey: table.primaryKeys.includes(col.dbColumn)
        })),
        // Does this table use a row expander for one-to-many?
        hasRowExpander: !!table.rowExpander
      };
    });

    // Split into data tables and lookup tables for convenience
    const dataTables = tables.filter(t => t.category === 'data');
    const lookupTables = tables.filter(t => t.category === 'lookup');
    
    res.json({
      tables,
      dataTables,
      lookupTables,
      count: tables.length
    });
  } catch (error: any) {
    console.error('Error fetching import tables:', error);
    res.status(500).json({ 
      error: 'Error fetching import tables',
      message: error.message 
    });
  }
});

export default router;