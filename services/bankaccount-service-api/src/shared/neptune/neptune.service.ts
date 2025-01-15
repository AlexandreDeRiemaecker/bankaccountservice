import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { driver, process as gprocess, structure } from 'gremlin';

/**
 * Service for interacting with Amazon Neptune using the Gremlin JavaScript client.
 */
@Injectable()
export class NeptuneService implements OnModuleInit, OnModuleDestroy {
  private readonly gremlinClient: driver.Client;
  public readonly g: gprocess.GraphTraversalSource;
  private readonly endpoint: string;
  private readonly logger = new Logger(NeptuneService.name);

  constructor() {
    const hostname = process.env.NEPTUNE_ENDPOINT_HOSTNAME;
    const port = process.env.NEPTUNE_ENDPOINT_PORT;

    if (!hostname || !port) {
      throw new Error(
        'NEPTUNE_ENDPOINT_HOSTNAME and NEPTUNE_ENDPOINT_PORT environment variables are required.',
      );
    }

    this.endpoint = `${'wss'}://${hostname}:${port}/gremlin`;

    this.gremlinClient = new driver.Client(this.endpoint, {
      traversalSource: 'g',
      mimeType: 'application/vnd.gremlin-v2.0+json',
    });

    const graph = new structure.Graph();
    this.g = graph
      .traversal()
      .withRemote(new driver.DriverRemoteConnection(this.endpoint));
  }

  /**
   * Lifecycle hook that is called when the module is initialized.
   */
  onModuleInit() {
    this.logger.log(
      `NeptuneService initialized with Gremlin endpoint: ${this.endpoint}`,
    );
  }

  /**
   * Lifecycle hook that is called when the module is destroyed.
   * Closes the Gremlin client.
   */
  async onModuleDestroy() {
    this.logger.log(
      'NeptuneService is being destroyed. Closing Gremlin client.',
    );
    try {
      await this.gremlinClient.close();
      this.logger.log('Gremlin client closed successfully.');
    } catch (error) {
      this.logger.error('Error closing Gremlin client:', error);
    }
  }

  /**
   * Add a vertex with a label and properties.
   * @param label Vertex label.
   * @param properties Vertex properties as a key-value pair.
   * @returns The added vertex.
   */
  async addVertex(
    label: string,
    properties: Record<string, any>,
  ): Promise<any> {
    try {
      let traversal = this.g.addV(label);
      for (const [key, value] of Object.entries(properties)) {
        traversal = traversal.property(key, value);
      }

      const result = await traversal.next();
      this.logger.log('Added vertex:', JSON.stringify(result, null, 2));
      return result.value;
    } catch (error) {
      this.logger.error('Error adding vertex:', error);
      throw error;
    }
  }

  /**
   * Add an edge between two vertices.
   * @param label Edge label.
   * @param fromVertexId ID of the starting vertex.
   * @param toVertexId ID of the ending vertex.
   * @returns The added edge.
   */
  async addEdge(
    label: string,
    fromVertexId: string,
    toVertexId: string,
  ): Promise<any> {
    try {
      const result = await this.g
        .V(fromVertexId)
        .addE(label)
        .to(this.g.V(toVertexId))
        .next();

      this.logger.log('Added edge:', JSON.stringify(result, null, 2));
      return result.value;
    } catch (error) {
      this.logger.error('Error adding edge:', error);
      throw error;
    }
  }

  /**
   * Update a vertex by its label, property, and value.
   * @param label The label of the vertex to update.
   * @param idProperty The property to filter by.
   * @param idValue The value of the property to filter by.
   * @param updates The properties to update.
   * @returns The updated vertex.
   */
  async updateVertex(
    label: string,
    idProperty: string,
    idValue: string,
    updates: Record<string, any>,
  ): Promise<string> {
    try {
      let traversal = this.g.V().hasLabel(label).has(idProperty, idValue);

      // Apply updates using sideEffect
      for (const [key, newValue] of Object.entries(updates)) {
        if (newValue !== undefined) {
          traversal = traversal.sideEffect(
            traversal.property(gprocess.cardinality.single, key, newValue),
          );
        }
      }

      // Use constant to indicate the update was performed
      const result = await traversal.constant('updated').next();

      if (result.value !== 'updated') {
        throw new Error('Failed to update vertex.');
      }

      // Retrieve the vertex ID after updates
      const vertexIdResult = await this.g
        .V()
        .hasLabel(label)
        .has(idProperty, idValue)
        .id()
        .next();

      if (!vertexIdResult.value) {
        throw new Error('Failed to retrieve the updated vertex ID.');
      }

      this.logger.log('Updated vertex and retrieved ID:', {
        label,
        idProperty: idProperty,
        idValue: idValue,
        updates,
        vertexId: vertexIdResult.value,
      });

      return vertexIdResult.value; // Return the updated vertex ID.
    } catch (error) {
      this.logger.error('Error updating vertex:', error);
      throw error;
    }
  }

  /**
   * Execute a traversal to find vertices with a given label.
   * @param label The label of the vertices to find.
   * @returns The list of vertices.
   */
  /**
   * Finds vertices in the graph with the specified label.
   *
   * @param label - The label of the vertices to find.
   * @returns A promise that resolves to an array of objects representing the vertices.
   * Each object contains the properties of the vertex, with single-value arrays flattened,
   * and excluding the `id` and `label` properties.
   *
   * @throws Will log an error and return an empty array if an error occurs during the query.
   */
  async findVertices(label: string): Promise<any[]> {
    try {
      const traversers = await this.g
        .V()
        .hasLabel(label)
        .valueMap(true) // Retrieve properties including meta-properties like vertex IDs.
        .toList();

      if (!traversers) {
        return [];
      }

      // Convert Map to plain object, flatten single-value arrays, and exclude `id` and `label`.
      const result = traversers.map((map: Map<string, any>) => {
        const obj = Object.fromEntries(Array.from(map.entries()));
        // Flatten properties that are single-value arrays.
        for (const key in obj) {
          if (Array.isArray(obj[key]) && obj[key].length === 1) {
            obj[key] = obj[key][0]; // Replace array with its single value.
          }
        }
        // Exclude `id` and `label`.
        delete obj.id;
        delete obj.label;

        return obj;
      });

      this.logger.log('Found vertices:', JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      this.logger.error('Error finding vertices:', error);
      return [];
    }
  }

  /**
   * Find a vertex by its label, property, and value.
   * @param label The label of the vertex to find.
   * @param idProperty The property to filter by.
   * @param idValue The value of the property to filter by.
   * @returns The found vertex.
   */
  async findVertexByProperty(
    label: string,
    idProperty: string,
    idValue: string,
  ): Promise<any> {
    try {
      const result = await this.g
        .V()
        .hasLabel(label)
        .has(idProperty, idValue)
        .valueMap(true) // Retrieve properties including meta-properties like IDs.
        .toList();

      if (!result || result.length === 0) {
        return null; // Return null if no vertex is found.
      }

      // Safely convert the Map-like object to a plain object.
      const map = result[0] as Map<string, any>;
      const vertex = Object.fromEntries(map.entries()); // Convert to plain object.

      // Flatten single-value arrays.
      for (const key in vertex) {
        if (Array.isArray(vertex[key]) && vertex[key].length === 1) {
          vertex[key] = vertex[key][0];
        }
      }

      // Optionally exclude `id` and `label`.
      delete vertex.id;
      delete vertex.label;

      return vertex;
    } catch (error) {
      throw new Error(`Failed to retrieve vertex: ${error.message}`);
    }
  }

  /**
   * Delete a vertex by its label, property, and value.
   * @param label The label of the vertex to delete.
   * @param idProperty The property to filter by.
   * @param idValue The value of the property to filter by.
   * @returns The ID of the deleted vertex.
   */
  async deleteVertex(
    label: string,
    idProperty: string,
    idValue: string,
  ): Promise<string> {
    try {
      // Locate the vertex and retrieve its ID
      const result: gprocess.Traverser[] = await this.g
        .V()
        .hasLabel(label) // Filter by label
        .has(idProperty, idValue) // Filter by property and its value
        .id() // Retrieve the ID of the vertex
        .toList();

      // Consistency check: Ensure that exactly one vertex was found
      if (result.length !== 1) {
        throw new Error(
          `Expected exactly 1 vertex but found ${result.length} for ${idProperty}=${idValue}, label=${label}`,
        );
      }

      const vertexId = result[0];

      // Delete the vertex by its ID using sideEffect(drop()).constant('gone')
      const deleteResult: { value: string } = await this.g
        .V(vertexId)
        .sideEffect(gprocess.statics.drop())
        .constant('gone')
        .next();

      // Check if the delete operation affected any vertex
      if (deleteResult.value !== 'gone') {
        throw new Error(`Failed to delete vertex with ID ${vertexId}`);
      }

      this.logger.log('Deleted vertex:', {
        label,
        idProperty,
        idValue,
        vertexId,
      });

      // Return the ID of the deleted vertex
      return vertexId.toString();
    } catch (error) {
      this.logger.error(`Error in deleteVertex: ${error.message}`);
      throw new Error(`Failed to delete vertex: ${error.message}`);
    }
  }

  /**
   * Find all vertices of a given label that have an edge connecting them.
   * @param label The label of the two vertices.
   * @returns The list of vertex pairs connected by the edges.
   */
  async findConnectedVertices(
    label: string,
  ): Promise<{ from: any; to: any }[]> {
    try {
      // Fetch all edges with the specified label
      const edges = await this.g.E().hasLabel(label).toList();

      // Batch fetch vertex pairs for all edges
      const vertexPairs = await Promise.all(
        edges.map(async (edge) => {
          const vertices = await this.g.E(edge).bothV().valueMap(true).toList();

          if (vertices.length === 2) {
            return {
              from: vertices[0],
              to: vertices[1],
            };
          }

          return null;
        }),
      );

      // Filter out null results
      return vertexPairs.filter((pair) => pair !== null);
    } catch (error) {
      this.logger.error(`Error finding edges with label: ${label}`, error);
      throw error;
    }
  }

  /**
   * Find an edge between two vertices.
   * @param label The label of the edge.
   * @param vertexLabel The label of the vertices.
   * @param idProperty The property to filter by.
   * @param fromId The ID of the starting vertex.
   * @param toId The ID of the ending vertex.
   * @returns The found edge with connected vertices.
   */
  async findEdgeBetweenVertices(
    label: string,
    vertexLabel: string,
    idProperty: string,
    fromId: string,
    toId: string,
  ): Promise<{ from: any; to: any } | null> {
    try {
      const edge = await this.g
        .V()
        .hasLabel(vertexLabel)
        .has(idProperty, fromId)
        .bothE(label)
        .has(idProperty, toId)
        .next();

      if (!edge.value) {
        // Return null if edge is not found
        return null;
      }

      const vertices = await this.g
        .E(edge.value)
        .bothV()
        .valueMap(true)
        .toList();
      if (vertices.length === 2) {
        return { from: vertices[0], to: vertices[1] };
      }
      throw new Error('Invalid edge vertices.');
    } catch (error) {
      this.logger.error('Error finding edge between vertices:', error);
      throw error;
    }
  }

  /**
   * Delete an edge by its ID.
   * @param edgeId The ID of the edge to delete.
   * @returns The ID of the deleted edge.
   */
  async deleteEdgeById(edgeId: string): Promise<string> {
    try {
      await this.g.E(edgeId).drop().iterate();
      return edgeId;
    } catch (error) {
      this.logger.error('Error deleting edge:', error);
      throw error;
    }
  }
}
