import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { driver, process as gprocess, structure } from 'gremlin';

/**
 * Service for interacting with Amazon Neptune using the Gremlin JavaScript client.
 */
@Injectable()
export class NeptuneService implements OnModuleInit, OnModuleDestroy {
  private readonly gremlinClient: driver.Client;
  private readonly g: gprocess.GraphTraversalSource;
  private readonly endpoint: string;

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

  getTraversal() {
    return this.g;
  }

  onModuleInit() {
    console.log(
      `NeptuneService initialized with Gremlin endpoint: ${this.endpoint}`,
    );
  }

  async onModuleDestroy() {
    console.log('NeptuneService is being destroyed. Closing Gremlin client.');
    try {
      await this.gremlinClient.close();
      console.log('Gremlin client closed successfully.');
    } catch (error) {
      console.error('Error closing Gremlin client:', error);
    }
  }

  /**
   * Example: Add a vertex with a label and properties.
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
      console.log('Added vertex:', JSON.stringify(result, null, 2));
      return result.value;
    } catch (error) {
      console.error('Error adding vertex:', error);
      throw error;
    }
  }

  /**
   * Example: Update a vertex by its label, property, and value.
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

      // Apply updates
      for (const [key, newValue] of Object.entries(updates)) {
        if (newValue !== undefined) {
          traversal = traversal.property(
            gprocess.cardinality.single,
            key,
            newValue,
          );
        }
      }

      // retrieve the vertex ID after updates
      const result = await traversal.id().next();

      if (!result.value) {
        throw new Error('Failed to update vertex or retrieve the ID.');
      }

      console.log('Updated vertex and retrieved ID:', {
        label,
        idProperty: idProperty,
        idValue: idValue,
        updates,
        vertexId: result.value,
      });

      return result.value; // Return the updated vertex ID.
    } catch (error) {
      console.error('Error updating vertex:', error);
      throw error;
    }
  }

  /**
   * Example: Execute a traversal to find vertices with a given label.
   * @param label The label of the vertices to find.
   * @returns The list of vertices.
   */
  async findVertices(label: string): Promise<any[]> {
    try {
      const traversers = await this.g
        .V()
        .hasLabel(label)
        .valueMap(true) // Retrieve properties including meta-properties like vertex IDs.
        .toList();

      // Convert Map to plain object, flatten single-value arrays, and exclude `id` and `label`.
      const result = traversers.map((map: Map<string, any>) => {
        const obj = Object.fromEntries(map);
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

      console.log('Found vertices:', JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error('Error finding vertices:', error);
      throw error;
    }
  }

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

  async deleteVertex(
    label: string,
    idProperty: string,
    idValue: string,
  ): Promise<string> {
    try {
      // Locate the vertex and retrieve its ID
      const result = await this.g
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

      // Delete the vertex by its ID
      await this.g.V(vertexId).drop().iterate();

      console.log('Deleted vertex:', { label, idProperty, idValue, vertexId });

      // Return the ID of the deleted vertex
      return vertexId.toString();
    } catch (error) {
      console.error('Error deleting vertex:', error);
      throw error;
    }
  }
}
