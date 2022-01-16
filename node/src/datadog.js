import tracer from 'dd-trace';

if (process.env.LAPPDOG_DD_DISABLED !== 'true') {
  tracer.init();
}

export default tracer;
