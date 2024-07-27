import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class CategoriesService {
    private sparqlEndpoint: string;

    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService
    ) {
        this.sparqlEndpoint = this.configService.get<string>('SPARQL_ENDPOINT');
    }

    async createCategory(categoryData: any): Promise<string> {
        try {
            const createdCategory = await this.prisma.category.create({ data: categoryData });
            await this.insertCategoryToRdf(createdCategory);
            return "Category created successfully";
        } catch (error) {
            throw error;
        }
    }

    private async insertCategoryToRdf(category: any): Promise<void> {
        const sparqlUpdate = `
            PREFIX ex: <http://example.com#>
            INSERT DATA {
                ex:category_${category.id} a ex:Category ;
                ex:categoryName "${category.name}" ;
                ex:categoryCreatedAt "${category.createdAt.toISOString()}" ;
                ex:categoryUpdatedAt "${category.updatedAt.toISOString()}" .
            }
        `;

        try {
            await axios.post(`${this.sparqlEndpoint}/categories`, sparqlUpdate, {
                headers: { 'Content-Type': 'application/sparql-update' }
            });
        } catch (error) {
            console.error('Failed to insert category into RDF store:', error);
            throw error;
        }
    }

    async updateCategory(id: string, categoryData: any): Promise<string> {
        try {
            const updatedCategory = await this.prisma.category.update({
                where: { id },
                data: categoryData,
            });
            await this.updateCategoryInRdf(updatedCategory);
            return "Category updated successfully";
        } catch (error) {
            throw error;
        }
    }

    private async updateCategoryInRdf(category: any): Promise<void> {
        const sparqlUpdate = `
            PREFIX ex: <http://example.com#>
            DELETE WHERE { ex:category_${category.id} ?p ?o };
            INSERT DATA {
                ex:category_${category.id} a ex:Category ;
                ex:categoryName "${category.name}" ;
                ex:categoryDescription "${category.description}" ;
                ex:categoryCreatedAt "${category.createdAt.toISOString()}" ;
                ex:categoryUpdatedAt "${category.updatedAt.toISOString()}" .
            }
        `;

        try {
            await axios.post(`${this.sparqlEndpoint}/categories`, sparqlUpdate, {
                headers: { 'Content-Type': 'application/sparql-update' }
            });
        } catch (error) {
            console.error('Failed to update category in RDF store:', error);
            throw error;
        }
    }

    // async deleteCategory(id: string): Promise<string> {
    //     try {
    //         await this.prisma.category.delete({ where: { id } });
    //         await this.deleteCategoryFromRdf(id);
    //         return "Category deleted successfully";
    //     } catch (error) {
    //         throw error;
    //     }
    // }

    // private async deleteCategoryFromRdf(id: string): Promise<void> {
    //     const sparqlUpdate = `
    //         PREFIX ex: <http://example.com#>
    //         DELETE WHERE { ex:category_${id} ?p ?o }
    //     `;

    //     try {
    //         await axios.post(`${this.sparqlEndpoint}/categories`, sparqlUpdate, {
    //             headers: { 'Content-Type': 'application/sparql-update' }
    //         });
    //     } catch (error) {
    //         console.error('Failed to delete category from RDF store:', error);
    //         throw error;
    //     }
    // }

    // async findCategoriesByCriteria(name: string): Promise<any> {
    //     try {
    //         const prismaCategories = await this.prisma.category.findMany({
    //             where: {
    //                 name: {
    //                     contains: name,
    //                     mode: 'insensitive',
    //                 }

    //             }
    //         });
    //         const rdfCategories = await this.findCategoriesFromRdf(name);
    //         return { prismaCategories, rdfCategories };
    //     } catch (error) {
    //         throw error;
    //     }
    // }

    // private async findCategoriesFromRdf(name: string): Promise<any> {
    //     const sparqlQuery = `
    //         PREFIX ex: <http://example.com#>
    //         SELECT ?categoryId ?categoryName ?categoryDescription ?categoryCreatedAt ?categoryUpdatedAt
    //         WHERE {
    //             ?category a ex:Category ;
    //                 ex:categoryName ?categoryName ;
    //                 ex:categoryCreatedAt ?categoryCreatedAt ;
    //                 ex:categoryUpdatedAt ?categoryUpdatedAt .
    //             FILTER (CONTAINS(LCASE(?categoryName), "${name.toLowerCase()}"))
    //         }
    //     `;

    //     try {
    //         const response = await axios.post(`${this.sparqlEndpoint}/categories/query`, sparqlQuery, {
    //             headers: { 'Content-Type': 'application/sparql-query' }
    //         });
    //         return response.data;
    //     } catch (error) {
    //         console.error('Failed to fetch categories from RDF store:', error);
    //         throw error;
    //     }
    // }

    // async findCategoryById(id: string): Promise<any> {
    //     try {
    //         const category = await this.prisma.category.findUnique({ where: { id } });
    //         const rdfCategory = await this.getCategoryFromRdf(id);
    //         return { category, rdfCategory };
    //     } catch (error) {
    //         throw error;
    //     }
    // }

    // private async getCategoryFromRdf(id: string): Promise<any> {
    //     const sparqlQuery = `
    //         PREFIX ex: <http://example.com#>
    //         SELECT ?categoryName ?categoryDescription ?categoryCreatedAt ?categoryUpdatedAt
    //         WHERE {
    //             ex:category_${id} a ex:Category ;
    //             ex:categoryName ?categoryName ;
    //             ex:categoryCreatedAt ?categoryCreatedAt ;
    //             ex:categoryUpdatedAt ?categoryUpdatedAt .
    //         }
    //     `;

    //     try {
    //         const response = await axios.post(`${this.sparqlEndpoint}/categories/query`, sparqlQuery, {
    //             headers: { 'Content-Type': 'application/sparql-query' }
    //         });
    //         return response.data;
    //     } catch (error) {
    //         console.error('Failed to fetch category from RDF store:', error);
    //         throw error;
    //     }
    // }

    async findAllCategories(): Promise<any> {
        try {
            const prismaCategories = await this.prisma.category.findMany({});

            const rdfCategories = await this.findAllCategoriesFromRdf();

            return { prismaCategories, rdfCategories };
        } catch (error) {
            console.error('Failed to find all categories:', error);
            throw error;
        }
    }

    private async findAllCategoriesFromRdf(): Promise<any> {
        const sparqlQuery = `
          PREFIX ex: <http://example.com#>
SELECT (STRAFTER(STR(?category), "#") AS ?categoryId)
       ?categoryName
       ?categoryCreatedAt
       ?categoryUpdatedAt
      
WHERE {
  # Récupérer les catégories
  ?category a ex:Category ;
            ex:categoryName ?categoryName ;
            ex:categoryCreatedAt ?categoryCreatedAt ;
            ex:categoryUpdatedAt ?categoryUpdatedAt .
}

        `;

        try {
            const response = await axios.post(`${this.sparqlEndpoint}/categories/query`, sparqlQuery, {
                headers: { 'Content-Type': 'application/sparql-query' }
            });
            console.log('==============>Fetch all Category from RDF store:', response.data.results.bindings);
            const results = response.data.results.bindings.map((binding: any) => {
                const categoryIdFull = binding.categoryId.value;
                const categoryId = categoryIdFull.replace('http://example.com#category_', '');

                return {
                    categoryId,
                    categoryName: binding.categoryName.value,
                    categoryCreatedAt: new Date(binding.categoryCreatedAt.value),
                    categoryUpdatedAt: new Date(binding.categoryUpdatedAt.value),

                };
            });

            return results;
        } catch (error) {
            console.error('Failed to fetch all categories from RDF store:', error);
            throw error;
        }
    }

}
