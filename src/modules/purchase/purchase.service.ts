import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ConfigService } from '@nestjs/config';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import axios from 'axios';
import { Product } from '@prisma/client';

@Injectable()
export class PurchaseService {
    private sparqlEndpoint: string;

    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
    ) {
        this.sparqlEndpoint = this.configService.get<string>('SPARQL_ENDPOINT');
    }


    async createPurchase(createPurchaseDto: CreatePurchaseDto): Promise<string> {
        try {
            const { userId, totalPrice, productIds } = createPurchaseDto;

            // Calcul du prix total des produits (vous devez implémenter cette fonction selon votre logique métier)


            // Création de l'achat avec transaction
            const createdPurchase = await this.prisma.purchase.create({
                data: {
                    userId: userId, // Assurez-vous que userId est correctement typé selon votre modèle Prisma
                    totalPrice: totalPrice,
                    products: {
                        connect: productIds.map((productId: string) => ({ id: productId })),
                    },

                },
                include: {
                    products: true,
                    user: true // Inclure les détails des produits associés à l'achat créé
                },

            });

            // Appel à une fonction pour insérer l'achat dans un store RDF, par exemple
            await this.insertPurchaseToRdf(createdPurchase);

            // Retourner un message de succès si nécessaire
            return 'Purchase created successfully';
        } catch (error) {
            throw error;
        }
    }

    private async insertPurchaseToRdf(purchase: any): Promise<void> {
        const productsRdfTriples = purchase.products.map((productId: any) => `
            ex:purchase_${purchase.id} ex:includesProduct ex:product_${productId.id} .
        `).join('\n');

        const sparqlUpdate = `
            PREFIX ex: <http://example.com#>
            INSERT DATA {
                ex:purchase_${purchase.id} a ex:Purchase ;
                    ex:userId "${purchase.userId}" ;
                    ex:totalPrice ${purchase.totalPrice} ;
                    ex:createdAt "${purchase.createdAt.toISOString()}" ;
                    ex:updatedAt "${purchase.updatedAt.toISOString()}" .
                ${productsRdfTriples}
            }
        `;

        try {
            // Envoi de la requête SPARQL via Axios
            await axios.post(`${this.sparqlEndpoint}/purchases`, sparqlUpdate, {
                headers: { 'Content-Type': 'application/sparql-update' },
            });
        } catch (error) {
            console.error('Failed to insert purchase into RDF store:', error);
            throw error;
        }
    }




    async deletePurchase(id: string): Promise<string> {
        try {
            await this.prisma.purchase.delete({ where: { id } });
            await this.deletePurchaseFromRdf(id);
            return 'Purchase deleted successfully';
        } catch (error) {
            throw error;
        }
    }

    private async deletePurchaseFromRdf(id: string): Promise<void> {
        const sparqlUpdate = `
      PREFIX ex: <http://example.com#>
      DELETE WHERE { ex:purchase_${id} ?p ?o }
    `;

        try {
            await axios.post(`${this.sparqlEndpoint}/purchases`, sparqlUpdate, {
                headers: { 'Content-Type': 'application/sparql-update' },
            });
        } catch (error) {
            console.error('Failed to delete purchase from RDF store:', error);
            throw error;
        }
    }

    async findPurchaseById(id: string): Promise<any> {
        try {
            const purchase = await this.prisma.purchase.findUnique({ where: { id } });
            const rdfPurchase = await this.getPurchaseFromRdf(id);
            return { purchase, rdfPurchase };
        } catch (error) {
            throw error;
        }
    }

    private async getPurchaseFromRdf(id: string): Promise<any> {
        const sparqlQuery = `
        PREFIX ex: <http://example.com#>
        SELECT ?purchaseId ?userId ?productId ?productName ?productDescription ?productPrice ?imagesUrl ?productCreatedAt ?productUpdatedAt
        WHERE {
        ex:purchase_${id} a ex:Purchase ;
                        ex:userId ?userId ;
                        ex:includesProduct ?product .

        # Endpoint des produits
        SERVICE <http://localhost:3030/products> {
            ?product ex:productName ?productName .
            ?product ex:productDescription ?productDescription .
            ?product ex:productPrice ?productPrice .
            ?product ex:imagesUrl ?imagesUrl .
            ?product ex:productCreatedAt ?productCreatedAt .
            ?product ex:productUpdatedAt ?productUpdatedAt .
        }

        BIND(STRAFTER(STR(?product), 'http://example.com#product_') AS ?productId)  # Extract productId from URI
        BIND(STRAFTER(STR(ex:purchase_123), 'http://example.com#purchase_') AS ?purchaseId)  # Extract purchaseId from URI
}`;

        try {
            const response = await axios.post(`${this.sparqlEndpoint}/purchases/query`, sparqlQuery, {
                headers: { 'Content-Type': 'application/sparql-query' },
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch purchase from RDF store:', error);
            throw error;
        }
    }

    async findAllPurchases(): Promise<any> {
        try {
            const prismaPurchases = await this.prisma.purchase.findMany();
            const rdfPurchases = await this.findAllPurchasesFromRdf();
            return { prismaPurchases, rdfPurchases };
        } catch (error) {
            console.error('Failed to find all purchases:', error);
            throw error;
        }
    }

    private async findAllPurchasesFromRdf(): Promise<any> {
        const sparqlQuery = `
     PREFIX ex: <http://example.com#>

SELECT ?purchaseId ?userId ?productId ?productName ?productDescription ?productPrice ?imagesUrl ?productCreatedAt ?productUpdatedAt
WHERE {
  ?purchase a ex:Purchase ;
            ex:userId ?userId ;
            ex:includesProduct ?product .

  # Endpoint des produits
  SERVICE <http://localhost:3030/products> {
    ?product ex:productName ?productName .
    ?product ex:productDescription ?productDescription .
    ?product ex:productPrice ?productPrice .
    ?product ex:imagesUrl ?imagesUrl .
    ?product ex:productCreatedAt ?productCreatedAt .
    ?product ex:productUpdatedAt ?productUpdatedAt .
  }

  BIND(STRAFTER(STR(?purchase), 'http://example.com#purchase_') AS ?purchaseId)  # Extract purchaseId from URI
  BIND(STRAFTER(STR(?product), 'http://example.com#product_') AS ?productId)  # Extract productId from URI
}

    `;

        try {
            const response = await axios.post(`${this.sparqlEndpoint}/purchases/query`, sparqlQuery, {
                headers: { 'Content-Type': 'application/sparql-query' },
            });

            const results = response.data.results.bindings.map((binding: any) => ({
                purchaseId: binding.purchaseId.value.replace('http://example.com#purchase_', ''),
                userId: binding.userId.value,
                productId: binding.productId.value,
                quantity: parseInt(binding.quantity.value),
                totalPrice: parseFloat(binding.totalPrice.value),
                createdAt: new Date(binding.createdAt.value),
                updatedAt: new Date(binding.updatedAt.value),
            }));

            return results;
        } catch (error) {
            console.error('Failed to fetch all purchases from RDF store:', error);
            throw error;
        }
    }
}
