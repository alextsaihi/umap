"use client";
import { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import { Checkbox, Label, Select } from 'flowbite-react';

interface Sample {
  id: number;
  metadata: {
    donor: string;
    buffer: string;
    "incubation time (hr)": number;
  };
  dataset: {
    id: number;
  };
}

interface SampleSignal {
  signal: number;
  sample: Sample;
  target: {
    id: number;
    name: string;
  };
}

interface UmapPlotPoint {
  x_coor: number;
  y_coor: number;
  sample: Sample;
}

export default function Page() {
  const [plotData, setPlotData] = useState<UmapPlotPoint[]>([]);
  const [sampleSignals, setSampleSignals] = useState<SampleSignal[]>([]);
  const [targets, setTargets] = useState<{ id: number; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedDatasets, setSelectedDatasets] = useState<Set<number>>(new Set());
  const [selectedDonors, setSelectedDonors] = useState<Set<string>>(new Set());
  const [selectedBuffers, setSelectedBuffers] = useState<Set<string>>(new Set());
  const [selectedIncubationTime, setSelectedIncubationTime] = useState<Set<number>>(new Set());
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Loading

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Set loading to true because first boot takes a long time
      try {
        const plotResponse = await fetch(`http://127.0.0.1:8000/api/umapplotpoint/`);
        if (!plotResponse.ok) {
          throw new Error('Plot Data response was not ok');
        }
        const plotData = await plotResponse.json();
        setPlotData(plotData);

        const donorSet = new Set<string>();
        const bufferSet = new Set<string>();
        const incubationTimeSet = new Set<number>();
        const datasetSet = new Set<number>();

        plotData.forEach(point => {
          datasetSet.add(point.sample.dataset.id);
          donorSet.add(point.sample.metadata.donor);
          bufferSet.add(point.sample.metadata.buffer);
          incubationTimeSet.add(point.sample.metadata["incubation time (hr)"]);

          if (point.dataset && point.dataset.id) {
            datasetSet.add(point.dataset.id);
          }
        });
        // default select all
        setSelectedDatasets(datasetSet);
        setSelectedDonors(donorSet);
        setSelectedBuffers(bufferSet);
        const sortedIncubationTimes = Array.from(incubationTimeSet).sort((a, b) => a - b);
        setSelectedIncubationTime(new Set<number>(sortedIncubationTimes));

        const signalResponse = await fetch(`http://127.0.0.1:8000/api/samplesignal/`);
        if (!signalResponse.ok) {
          throw new Error('Sample Signal response was not ok');
        }
        const signalData = await signalResponse.json();
        setSampleSignals(signalData);

        const targetResponse = await fetch(`http://127.0.0.1:8000/api/target/`);
        if (!targetResponse.ok) {
          throw new Error('Target response was not ok');
        }
        const targetData = await targetResponse.json();
        setTargets(targetData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  if (loading) {
    return <div style={{ color: 'black' }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ color: 'black' }}>Error: {error}</div>;
  }

  // plot filters
  const filteredPlotData = plotData.filter(point => {
    const sample = point.sample;

    const datasetIncluded = selectedDatasets.size === 0 || selectedDatasets.has(sample.dataset.id);
    const donorIncluded = selectedDonors.size === 0 || selectedDonors.has(sample.metadata.donor);
    const bufferIncluded = selectedBuffers.size === 0 || selectedBuffers.has(sample.metadata.buffer);
    const incubationIncluded = selectedIncubationTime.size === 0 || selectedIncubationTime.has(sample.metadata["incubation time (hr)"]);
    const targetIncluded = selectedTarget === null || sampleSignals.some(signal => signal.sample.id === sample.id && signal.target.id === selectedTarget);

    return datasetIncluded && donorIncluded && bufferIncluded && incubationIncluded && targetIncluded;
  });

  const xValues = filteredPlotData.map(point => point.x_coor);
  const yValues = filteredPlotData.map(point => point.y_coor);

  const colors = filteredPlotData.map(point => {
    const signal = sampleSignals.find(signal => signal.sample.id === point.sample.id && signal.target.id === selectedTarget);
    return signal ? signal.signal : 0; // Default to 0 if no signal
  });

  // sort lists
  const datasetOptions = Array.from(new Set(plotData.map(point => point.sample.dataset.id))).sort();
  const donorOptions = Array.from(new Set(plotData.map(point => point.sample.metadata.donor))).sort();
  const bufferOptions = Array.from(new Set(plotData.map(point => point.sample.metadata.buffer)));
  const incubationTimeOptions = Array.from(new Set(plotData.map(point => point.sample.metadata["incubation time (hr)"]))).sort((a, b) => a - b);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4 text-black text-center">UMAP Scatterplot</h1>

      <div className="flex flex-wrap mb-4 gap-4 justify-center">

        <div className="flex flex-col">
          <h2 className="text-xl font-semibold mb-1 text-black">Dataset 2</h2>
          {datasetOptions.map(dataset => (
            <Label key={dataset} className="block">
              <Checkbox
                checked={selectedDatasets.has(dataset)}
                onChange={(e) => {
                  const newSelectedDatasets = new Set(selectedDatasets);
                  if (e.target.checked) {
                    newSelectedDatasets.add(dataset);
                  } else {
                    newSelectedDatasets.delete(dataset);
                  }
                  setSelectedDatasets(newSelectedDatasets);
                }}
              />
              {`Set ${dataset}`}
            </Label>
          ))}
        </div>

        <div className="flex flex-col">
          <h2 className="text-xl font-semibold mb-1 text-black">Donor</h2>
          {donorOptions.map(donor => (
            <Label key={donor} className="block">
              <Checkbox
                checked={selectedDonors.has(donor)}
                onChange={(e) => {
                  const newSelectedDonors = new Set(selectedDonors);
                  if (e.target.checked) {
                    newSelectedDonors.add(donor);
                  } else {
                    newSelectedDonors.delete(donor);
                  }
                  setSelectedDonors(newSelectedDonors);
                }}
              />
              {donor}
            </Label>
          ))}
        </div>

        <div className="flex flex-col">
          <h2 className="text-xl font-semibold mb-1 text-black">Buffer</h2>
          {bufferOptions.map(buffer => (
            <Label key={buffer} className="block">
              <Checkbox
                checked={selectedBuffers.has(buffer)}
                onChange={(e) => {
                  const newSelectedBuffers = new Set(selectedBuffers);
                  if (e.target.checked) {
                    newSelectedBuffers.add(buffer);
                  } else {
                    newSelectedBuffers.delete(buffer);
                  }
                  setSelectedBuffers(newSelectedBuffers);
                }}
              />
              {buffer}
            </Label>
          ))}
        </div>

        <div className="flex flex-col">
          <h2 className="text-xl font-semibold mb-1 text-black">Incubation Time</h2>
          {incubationTimeOptions.map(time => (
            <Label key={time} className="block">
              <Checkbox
                checked={selectedIncubationTime.has(time)}
                onChange={(e) => {
                  const newSelectedIncubationTime = new Set(selectedIncubationTime);
                  if (e.target.checked) {
                    newSelectedIncubationTime.add(time);
                  } else {
                    newSelectedIncubationTime.delete(time);
                  }
                  setSelectedIncubationTime(newSelectedIncubationTime);
                }}
              />
              {`${time} hr`}
            </Label>
          ))}
        </div>




        <div className="flex flex-col">
          <h2 className="text-xl font-semibold mb-1 text-black">Target</h2>
          <Select
            value={selectedTarget ?? ''}
            onChange={(e) => setSelectedTarget(e.target.value ? Number(e.target.value) : null)}
          >
            {targets.map(target => (
              <option key={target.id} value={target.id}>
                {target.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="flex justify-center">
        {filteredPlotData.length > 0 ? (
          <Plot
            data={[{
              x: xValues,
              y: yValues,
              mode: 'markers',
              type: 'scatter',
              marker: {
                size: 10,
                color: colors,
                colorscale: 'Viridis',
                colorbar: {
                  title: 'nELISA signal',
                },
              },
            }]}
            layout={{
              title: 'IFN gamma',
              xaxis: { title: 'X Coordinate' },
              yaxis: { title: 'Y Coordinate' },
            }}
          />
        ) : (
          <div className="text-center mt-4">No plot points available.</div>
        )}
      </div>
    </div>
  );
}
