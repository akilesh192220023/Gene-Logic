import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Button,
  Linking,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function App() {
  const [sequence, setSequence] = useState("");
  const [geneInfo, setGeneInfo] = useState<null | {
    name: string;
    description: string;
    summary: string;
    organism?: string;
    chromosome?: string;
    maplocation?: string;
    otheraliases?: string;
    otherdesignations?: string;
    nomenclaturesymbol?: string;
    nomenclaturename?: string;
    nomenclaturestatus?: string;
    ncbi_link?: string;
    error?: string;
    exoncount?: number;
    taxid?: number;
    chraccver?: string;
    chrstart?: number;
    chrstop?: number;
    assemblyaccver?: string;
    annotationrelease?: string;
  }>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleConfirm = async () => {
    if (!sequence.trim()) {
      alert("Please enter a FASTA sequence.");
      return;
    }

    setLoading(true);
    setGeneInfo(null);

    try {
      const header = sequence.split("\n")[0].replace(">", "").trim();
      let tried = [];
      let found = false;
      let searchResp, searchJson;

      let searchTerms: string[] = [];

      // 1. RefSeq/GenBank accession (e.g., NM_007294.3)
      const accMatch = header.match(/([A-Z]{2}_[0-9]+\.[0-9]+)/);
      if (accMatch && accMatch[1]) {
        searchTerms.push(accMatch[1]);
        tried.push(`${accMatch[1]} [accession]`);
      }

      // 2. Look for gene= or gene_ or gene:
      const geneMatch = header.match(/gene[_=:-]?([A-Za-z0-9]+)/i);
      if (geneMatch && geneMatch[1]) {
        searchTerms.push(geneMatch[1]);
        tried.push(`${geneMatch[1]} [gene tag]`);
      }

      // 3. Uppercase fallback
      const words = header.split(/\W+/);
      const upperWords = words.filter(
        (w) => w.length >= 2 && /^[A-Z0-9]+$/.test(w)
      );
      if (upperWords.length) {
        const guess = upperWords[upperWords.length - 1];
        searchTerms.push(guess);
        tried.push(`${guess} [symbol guess]`);
      }

      // 4. Entire header
      searchTerms.push(header);
      tried.push(`${header} [full header]`);

      let geneId = null;

      for (let term of searchTerms) {
        const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=gene&term=${encodeURIComponent(
          term
        )}&retmode=json`;
        searchResp = await fetch(url);
        searchJson = await searchResp.json();
        console.log('NCBI Search Response:', searchJson);

        if (
          searchJson?.esearchresult?.idlist &&
          searchJson.esearchresult.idlist.length > 0
        ) {
          geneId = searchJson.esearchresult.idlist[0];
          found = true;
          break;
        }
      }

      if (!found || !geneId) {
        setGeneInfo({
          error: `Gene not found. Tried: ${tried.join(", ")}`,
          name: "",
          description: "",
          summary: "",
        });
        setLoading(false);
        return;
      }

      // Fetch gene details
      const summaryResp = await fetch(
        `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=gene&id=${geneId}&retmode=json`
      );
      const summaryJson = await summaryResp.json();
      console.log('NCBI Summary Response:', summaryJson);
      const geneData = summaryJson.result?.[geneId];

      if (!geneData || !geneData.name) {
        setGeneInfo({
          error: "Gene details not found in NCBI summary response.",
          name: "",
          description: "",
          summary: "",
        });
        setLoading(false);
        return;
      }

      // ✅ Set full gene info
      setGeneInfo({
        name: geneData.name,
        description: geneData.description,
        summary: geneData.summary,
        organism: geneData.organism?.scientificname,
        chromosome: geneData.chromosome,
        maplocation: geneData.maplocation,
        otheraliases: geneData.otheraliases,
        otherdesignations: geneData.otherdesignations,
        nomenclaturesymbol: geneData.nomenclaturesymbol,
        nomenclaturename: geneData.nomenclaturename,
        nomenclaturestatus: geneData.nomenclaturestatus,
        ncbi_link: `https://www.ncbi.nlm.nih.gov/gene/${geneId}`,
        exoncount:
          Array.isArray(geneData.genomicinfo) && geneData.genomicinfo.length > 0
            ? geneData.genomicinfo[0].exoncount
            : undefined,
        taxid: geneData.organism?.taxid,
        chraccver:
          Array.isArray(geneData.genomicinfo) && geneData.genomicinfo.length > 0
            ? geneData.genomicinfo[0].chraccver
            : undefined,
        chrstart:
          Array.isArray(geneData.genomicinfo) && geneData.genomicinfo.length > 0
            ? geneData.genomicinfo[0].chrstart
            : undefined,
        chrstop:
          Array.isArray(geneData.genomicinfo) && geneData.genomicinfo.length > 0
            ? geneData.genomicinfo[0].chrstop
            : undefined,
        assemblyaccver:
          Array.isArray(geneData.locationhist) &&
          geneData.locationhist.length > 0
            ? geneData.locationhist[0].assemblyaccver
            : undefined,
        annotationrelease:
          Array.isArray(geneData.locationhist) &&
          geneData.locationhist.length > 0
            ? geneData.locationhist[0].annotationrelease
            : undefined,
      });
    } catch (err) {
      console.error(err);
      setGeneInfo({
        error: "Error fetching gene information.",
        name: "",
        description: "",
        summary: "",
      });
    }

    setLoading(false);
  };

  const handleClear = () => {
    setSequence("");
    setGeneInfo(null);
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open URL:", err)
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>NCBI Gene Sequence Search</Text>
      <Text style={styles.label}>Enter FASTA Sequence:</Text>
      <TextInput
        multiline
        numberOfLines={6}
        value={sequence}
        onChangeText={setSequence}
        placeholder={">NM_007294.3 BRCA1 gene\nATGCGTACGTAGCTAGCTAGCTGACT..."}
        style={styles.input}
      />
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>
      {loading && (
        <ActivityIndicator
          size="large"
          color="#2563eb"
          style={{ marginTop: 10 }}
        />
      )}
      {geneInfo && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Gene Information</Text>
          {geneInfo.error ? (
            <Text>{geneInfo.error}</Text>
          ) : (
            <React.Fragment>
              {geneInfo.nomenclaturesymbol &&
                geneInfo.nomenclaturesymbol !== geneInfo.name && (
                  <Text
                    style={{
                      textAlign: "center",
                      color: "#64748b",
                      fontSize: 16,
                      marginBottom: 4,
                    }}
                  >
                    <Text style={{ fontWeight: 'bold' }}>Symbol: </Text>
                    {geneInfo.nomenclaturesymbol}
                  </Text>
                )}
              {geneInfo.organism && (
                <Text
                  style={{
                    fontStyle: "italic",
                    color: "#334155",
                    fontSize: 18,
                    textAlign: "center",
                    marginBottom: 10,
                  }}
                >
                  <Text style={{ fontWeight: 'bold' }}>Organism: </Text>
                  {geneInfo.organism}
                </Text>
              )}
              {geneInfo.nomenclaturename && (
                <Text
                  style={{ marginTop: 2, fontSize: 16, textAlign: "center" }}
                >
                  <Text style={{ fontWeight: 'bold' }}>Official Name: </Text>
                  {geneInfo.nomenclaturename}
                </Text>
              )}
              {geneInfo.nomenclaturestatus && (
                <Text style={{ fontSize: 16, textAlign: "center" }}>
                  <Text style={{ fontWeight: 'bold' }}>Status: </Text>
                  {geneInfo.nomenclaturestatus}
                </Text>
              )}
              {geneInfo.description && (
                <Text
                  style={{
                    marginTop: 14,
                    fontWeight: "600",
                    fontSize: 17,
                    color: "#0f172a",
                    textAlign: "center",
                  }}
                >
                  <Text style={{ fontWeight: 'bold' }}>Description: </Text>
                  {geneInfo.description}
                </Text>
              )}
              {geneInfo.summary && (
                <Text
                  style={{
                    marginTop: 10,
                    fontSize: 15,
                    color: "#334155",
                    textAlign: "center",
                  }}
                >
                  <Text style={{ fontWeight: 'bold' }}>Summary: </Text>
                  {geneInfo.summary}
                </Text>
              )}
              {geneInfo.chromosome && (
                <Text
                  style={{ marginTop: 12, fontSize: 15, textAlign: "center" }}
                >
                    <Text style={{ fontWeight: 'bold' }}>Chromosome: </Text>
                  {geneInfo.chromosome}
                </Text>
              )}
              {geneInfo.maplocation && geneInfo.maplocation !== "" && (
                <Text
                  style={{ fontSize: 15, textAlign: "center", marginTop: 2 }}
                >
                  <Text style={{ fontWeight: 'bold' }}>Map Location: </Text>
                  {geneInfo.maplocation}
                </Text>
              )}
              {/* Additional NCBI fields: Exon Count, Organism TaxID */}
              {typeof geneInfo.exoncount !== "undefined" &&
                geneInfo.exoncount !== null && (
                  <Text
                    style={{ fontSize: 15, textAlign: "center", marginTop: 2 }}
                  >
                    <Text style={{ fontWeight: 'bold' }}>Exon Count: </Text>
                    {geneInfo.exoncount}
                  </Text>
                )}
              {typeof geneInfo.taxid !== "undefined" &&
                geneInfo.taxid !== null && (
                  <Text
                    style={{ fontSize: 15, textAlign: "center", marginTop: 2 }}
                  >
                    <Text style={{ fontWeight: 'bold' }}>Organism TaxID: </Text>
                    {geneInfo.taxid}
                  </Text>
                )}
              {geneInfo.chraccver && (
                <Text
                  style={{ fontSize: 15, textAlign: "center", marginTop: 2 }}
                >
                  <Text style={{ fontWeight: 'bold' }}>
                    Chromosome Accession:{" "}
                  </Text>
                  {geneInfo.chraccver}
                </Text>
              )}
              {typeof geneInfo.chrstart !== "undefined" &&
                geneInfo.chrstart !== null && (
                  <Text
                    style={{ fontSize: 15, textAlign: "center", marginTop: 2 }}
                  >
                    <Text style={{ fontWeight: 'bold' }}>
                      Chromosome Start:{" "}
                    </Text>
                    {geneInfo.chrstart}
                  </Text>
                )}
              {typeof geneInfo.chrstop !== "undefined" &&
                geneInfo.chrstop !== null && (
                  <Text
                    style={{ fontSize: 15, textAlign: "center", marginTop: 2 }}
                  >
                    <Text style={{ fontWeight: 'bold' }}>Chromosome Stop: </Text>
                    {geneInfo.chrstop}
                  </Text>
                )}
              {geneInfo.assemblyaccver && (
                <Text
                  style={{ fontSize: 15, textAlign: "center", marginTop: 2 }}
                >
                  <Text style={{ fontWeight: 'bold' }}>
                    Assembly Accession:{" "}
                  </Text>
                  {geneInfo.assemblyaccver}
                </Text>
              )}
              {geneInfo.annotationrelease && (
                <Text
                  style={{ fontSize: 15, textAlign: "center", marginTop: 2 }}
                >
                  <Text style={{ fontWeight: 'bold' }}>
                    Annotation Release:{" "}
                  </Text>
                  {geneInfo.annotationrelease}
                </Text>
              )}
              {geneInfo.otheraliases && (
                <Text
                  style={{ marginTop: 8, fontSize: 15, textAlign: "center" }}
                >
                  <Text style={{ fontWeight: 'bold' }}>Aliases: </Text>
                  {geneInfo.otheraliases}
                </Text>
              )}
              {geneInfo.otherdesignations && (
                <Text
                  style={{ marginTop: 8, fontSize: 15, textAlign: "center" }}
                >
                  <Text style={{ fontWeight: 'bold' }}>
                    Other Designations:{" "}
                  </Text>
                  {geneInfo.otherdesignations}
                </Text>
              )}
              {geneInfo.ncbi_link && (
                <TouchableOpacity
                  onPress={() => openLink(geneInfo.ncbi_link!)}
                  style={{
                    marginTop: 18,
                    alignSelf: "center",
                    backgroundColor: "#2563eb",
                    borderRadius: 6,
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      textDecorationLine: "underline",
                      fontWeight: "bold",
                      fontSize: 16,
                      paddingHorizontal: 18,
                      paddingVertical: 8,
                    }}
                    selectable
                  >
                    View on NCBI
                  </Text>
                </TouchableOpacity>
              )}
            </React.Fragment>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    paddingTop: 50,
    paddingHorizontal: 0,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: '#2a4d69',
    textAlign: 'center' as const,
    marginBottom: 18,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#334155',
    fontWeight: '600' as const,
  },
  input: {
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    fontSize: 15,
    minHeight: 100,
  },
  buttonRow: {
    flexDirection: "row" as const,
    marginBottom: 10,
    // gap: 10, // not supported in RN
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#2a4d69',
    borderRadius: 8,
    alignItems: 'center' as const,
    paddingVertical: 12,
    marginRight: 5,
    shadowColor: '#2a4d69',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold' as const,
    letterSpacing: 1,
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#64748b',
    borderRadius: 8,
    alignItems: 'center' as const,
    paddingVertical: 12,
    marginLeft: 5,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold' as const,
    letterSpacing: 1,
  },
  card: {
    marginTop: 20,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 320,
    justifyContent: 'center' as const,
    alignItems: 'stretch' as const,
    alignSelf: 'stretch' as const,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold" as const,
    color: '#2a4d69',
    textAlign: 'center' as const,
    marginBottom: 14,
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 600,
  },
};